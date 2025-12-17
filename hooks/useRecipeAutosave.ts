import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

/**
 * Kohanda need tabeli nimed/veerud vastavalt sinu DB-le.
 * Eeldused (sinu skeemi põhjal):
 * - recipes: id, title, description, image_url, kitchen_id, author_user_id
 * - recipe_ingredients: recipe_id, ingredient, quantity, unit, sort_order
 * - recipe_kitchens: recipe_id, kitchen_id
 * - recipe_categories: recipe_id, category_id
 */

export type IngredientDraft = {
  ingredient: string;
  quantity: number | string | null;
  unit: string | null;
  sort_order: number; // kasuta 0..n-1
};

export type RecipeDraftState = {
  // põhiväli
  title: string;
  description: string | null;
  image_url: string | null;

  // vähemalt 1 köök on alati garanteeritud
  // hoia järjekord: [primary, ...others]
  kitchen_ids: string[]; // 1+ items
  category_ids: string[]; // märksõnad/tags (su skeemis categories)

  ingredients: IngredientDraft[];
};

type Options = {
  /**
   * Kui editid olemasolevat retsepti, anna siia recipeId.
   * Kui addid uut, jäta undefined — hook loob drafti, kui tekib esimene save.
   */
  recipeId?: string;

  /**
   * Tagastab hetke vormi/drafti state’i (hook ei halda su inpute).
   * Tee see memo’ga, kui võimalik.
   */
  getState: () => RecipeDraftState;

  /**
   * Kui true, autosave töötab. Kui false, ei tee midagi.
   */
  enabled?: boolean;

  /**
   * Debounce aeg (ms), default 700
   */
  debounceMs?: number;

  /**
   * Kui tahad teada, mis recipeId lõpuks kasutusel on (eriti add-mode jaoks).
   */
  onRecipeId?: (id: string) => void;

  /**
   * Error handler
   */
  onError?: (err: string) => void;
};

type AutosaveStatus = "idle" | "saving" | "saved" | "error";

function normalizeNumberLike(v: number | string | null): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function useRecipeAutosave(opts: Options) {
  const {
    recipeId: recipeIdProp,
    getState,
    enabled = true,
    debounceMs = 700,
    onRecipeId,
    onError,
  } = opts;

  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const recipeIdRef = useRef<string | undefined>(recipeIdProp);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const dirtyRef = useRef(false);

  // hoia prop -> ref sync (edit flow)
  useEffect(() => {
    recipeIdRef.current = recipeIdProp;
  }, [recipeIdProp]);

  const clearTimer = () => {
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
  };

  const markDirty = useCallback(() => {
    if (!enabled) return;
    dirtyRef.current = true;

    clearTimer();
    pendingTimerRef.current = setTimeout(() => {
      void saveNow("debounced");
    }, debounceMs);
  }, [enabled, debounceMs]);

  const ensureDraftRecipeRow = useCallback(async (): Promise<string> => {
    // kui juba olemas, done
    if (recipeIdRef.current) return recipeIdRef.current;

    // kasutaja peab olemas olema
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) throw new Error("Not authenticated");

    const state = getState();

    // primary kitchen peab olemas olema
    const primaryKitchenId = state.kitchen_ids?.[0];
    if (!primaryKitchenId) throw new Error("Primary kitchen missing");

    // NB! Kui su DB-s title on NOT NULL, siis pane mingi default.
    // Kui lubad tühja, võid panna "".
    const safeTitle = state.title?.trim() || "Untitled";

    const { data, error } = await supabase
      .from("recipes")
      .insert({
        title: safeTitle,
        description: state.description,
        image_url: state.image_url,
        kitchen_id: primaryKitchenId,
        author_user_id: userId,
      })
      .select("id")
      .single();

    if (error || !data?.id) throw error ?? new Error("Draft create failed");

    const newId = String(data.id);
    recipeIdRef.current = newId;
    onRecipeId?.(newId);
    return newId;
  }, [getState, onRecipeId]);

  const savePayload = useCallback(async () => {
    const id = await ensureDraftRecipeRow();
    const state = getState();

    // 1) Update recipes row (primary kitchen = first)
    const primaryKitchenId = state.kitchen_ids?.[0];
    if (!primaryKitchenId) throw new Error("Primary kitchen missing");

    const title = state.title?.trim() || "Untitled";

    {
      const { error } = await supabase
        .from("recipes")
        .update({
          title,
          description: state.description,
          image_url: state.image_url,
          kitchen_id: primaryKitchenId,
        })
        .eq("id", id);

      if (error) throw error;
    }

    // 2) Sync recipe_kitchens (simple approach: delete all then insert)
    {
      const { error: delErr } = await supabase
        .from("recipe_kitchens")
        .delete()
        .eq("recipe_id", id);
      if (delErr) throw delErr;

      const uniqueKitchenIds = Array.from(
        new Set((state.kitchen_ids ?? []).filter(Boolean))
      );

      const rows = uniqueKitchenIds.map((kid) => ({
        recipe_id: id,
        kitchen_id: kid,
      }));

      if (rows.length > 0) {
        const { error: insErr } = await supabase
          .from("recipe_kitchens")
          .insert(rows);
        if (insErr) throw insErr;
      }
    }

    // 3) Sync recipe_categories (tags) (delete all then insert)
    {
      const { error: delErr } = await supabase
        .from("recipe_categories")
        .delete()
        .eq("recipe_id", id);
      if (delErr) throw delErr;

      const uniqueCatIds = Array.from(
        new Set((state.category_ids ?? []).filter(Boolean))
      );

      const rows = uniqueCatIds.map((cid) => ({
        recipe_id: id,
        category_id: cid,
      }));

      if (rows.length > 0) {
        const { error: insErr } = await supabase
          .from("recipe_categories")
          .insert(rows);
        if (insErr) throw insErr;
      }
    }

    // 4) Sync ingredients (delete all then insert, with sort_order)
    {
      const { error: delErr } = await supabase
        .from("recipe_ingredients")
        .delete()
        .eq("recipe_id", id);
      if (delErr) throw delErr;

      const cleaned = (state.ingredients ?? [])
        .map((ing, idx) => ({
          recipe_id: id,
          ingredient: (ing.ingredient ?? "").trim(),
          quantity: normalizeNumberLike(ing.quantity),
          unit: ing.unit,
          sort_order: Number.isFinite(ing.sort_order) ? ing.sort_order : idx,
        }))
        // ära salvesta täiesti tühje ridu
        .filter((x) => x.ingredient.length > 0 || x.quantity != null || !!x.unit);

      // fallback sort_order, kui UI ei anna
      cleaned.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

      if (cleaned.length > 0) {
        const { error: insErr } = await supabase
          .from("recipe_ingredients")
          .insert(cleaned);
        if (insErr) throw insErr;
      }
    }

    // saved!
    dirtyRef.current = false;
    setLastSavedAt(Date.now());
  }, [ensureDraftRecipeRow, getState]);

  const saveNow = useCallback(
    async (reason: "debounced" | "flush" | "appstate") => {
      if (!enabled) return;

      // kui pole dirty, ära tee mõttetut save’i
      if (!dirtyRef.current && reason !== "flush") return;

      // kui juba save käib, ära paralleelselt teist alusta
      if (inFlightRef.current) return inFlightRef.current;

      setStatus("saving");

      const p = (async () => {
        try {
          await savePayload();
          setStatus("saved");
        } catch (e: any) {
          const msg = e?.message ?? "Autosave failed";
          setStatus("error");
          onError?.(msg);
        } finally {
          inFlightRef.current = null;
        }
      })();

      inFlightRef.current = p;
      return p;
    },
    [enabled, savePayload, onError]
  );

  const flush = useCallback(async () => {
    clearTimer();
    await saveNow("flush");
  }, [saveNow]);

  // Flush kui screen kaotab fookuse / unmountib (expo-router)
  useFocusEffect(
    useCallback(() => {
      return () => {
        // fire-and-forget on purpose (React cleanup ei oota async)
        void flush();
      };
    }, [flush])
  );

  // Flush kui app läheb backgroundi
  useEffect(() => {
    const onAppState = (next: AppStateStatus) => {
      if (next !== "active") void saveNow("appstate");
    };

    const sub = AppState.addEventListener("change", onAppState);
    return () => sub.remove();
  }, [saveNow]);

  // cleanup timer
  useEffect(() => {
    return () => clearTimer();
  }, []);

  return useMemo(
    () => ({
      markDirty, // kutsu seda igal input muutusel / köögi valikul / unit change’il
      flush, // kui tahad käsitsi (nt enne navigeerimist)
      status,
      lastSavedAt,
      recipeId: recipeIdRef.current,
    }),
    [markDirty, flush, status, lastSavedAt]
  );
}
