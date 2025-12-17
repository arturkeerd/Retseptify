import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import AddIcon from "@/assets/images/add.png";
import DeleteIcon from "@/assets/images/delete.png";
import PhotoIcon from "@/assets/images/photo.png";

import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import DescriptionCard from "@/components/DescriptionCard";
import HomeButton from "@/components/HomeButton";
import IngredientsTable, { IngredientRow } from "@/components/IngredientsTable";
import KitchenPickerModal from "@/components/KitchenPickerModal";
import type { Kitchen } from "@/components/KitchensModal";
import ProfileButton from "@/components/ProfileButton";

// NB: sul võib olla 2-step picker eraldi failis.
// Kui sul on see olemas, vaheta siinsamas import tagasi TwoStepUnitPickerForRecipe peale.
import UnitPickerForRecipe from "@/components/UnitPickerForRecipe";

import { convertQuantitySameCategory } from "@/lib/unitConversion";
import styles from "./styles";

type Category = { id: string; name: string };

const DRAFT_KEY_NEW = "addrecipe:draft:new";
const draftKeyEdit = (id: string) => `addrecipe:draft:edit:${id}`;

async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const res = await fetch(uri);
  return await res.arrayBuffer();
}

export default function AddRecipe() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; recipeId?: string }>();

  // support both param names
  const id = params.id ?? params.recipeId;
  const isEdit = !!id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [servings, setServings] = useState("1");

  const [rows, setRows] = useState<IngredientRow[]>([
    { key: "0", name: "", quantity: "", unit: null },
  ]);

  const [description, setDescription] = useState("");

  // kitchens
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchenIds, setSelectedKitchenIds] = useState<string[]>([]);
  const selectedKitchenId = selectedKitchenIds[0] ?? null;
  const primaryKitchen = kitchens.find((k) => k.id === selectedKitchenId) ?? null;

  // categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categoriesModalVisible, setCategoriesModalVisible] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // modals
  const [unitPickerRowKey, setUnitPickerRowKey] = useState<string | null>(null);
  const [kitchenPickerVisible, setKitchenPickerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // debounce timers
  const draftTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dbTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draftKey = useMemo(
    () => (isEdit && id ? draftKeyEdit(id) : DRAFT_KEY_NEW),
    [isEdit, id]
  );

  // ---------- LOAD KITCHENS (FILTERED: owner + member) ----------
  useEffect(() => {
    const loadKitchens = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;

      if (!userId) {
        setKitchens([]);
        return;
      }

      const { data: memberRows, error: memErr } = await supabase
        .from("kitchen_members")
        .select("kitchen_id")
        .eq("user_id", userId);

      if (memErr) console.log("kitchen_members error", memErr.message);

      const memberKitchenIds = (memberRows ?? []).map((r: any) => r.kitchen_id);

      let q = supabase.from("kitchens").select("id, name, color");

      if (memberKitchenIds.length > 0) {
        q = q.or(
          `owner_user_id.eq.${userId},id.in.(${memberKitchenIds.join(",")})`
        );
      } else {
        q = q.eq("owner_user_id", userId);
      }

      const { data, error } = await q;

      if (error) {
        console.log("loadKitchens error", error.message);
        setKitchens([]);
        return;
      }

      const list = (data as Kitchen[]) ?? [];
      setKitchens(list);

      // auto pick if only one
      setSelectedKitchenIds((prev) => {
        if (prev.length > 0) return prev;
        if (list.length === 1) return [list[0].id];
        return prev;
      });
    };

    loadKitchens();
  }, []);

  // ---------- LOAD CATEGORIES ----------
  const loadCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.log("loadCategories error", error.message);
      setCategories([]);
      return;
    }

    setCategories((data as Category[]) ?? []);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ---------- LOAD DRAFT ----------
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const raw = await AsyncStorage.getItem(draftKey);
        if (!raw) return;
        const d = JSON.parse(raw);

        if ("imageUrl" in d) setImageUrl(d.imageUrl ?? null);
        if ("title" in d && typeof d.title === "string") setTitle(d.title);
        if ("servings" in d && typeof d.servings === "string") setServings(d.servings);
        if ("rows" in d && Array.isArray(d.rows)) setRows(d.rows);
        if ("description" in d && typeof d.description === "string") setDescription(d.description);
        if ("selectedKitchenIds" in d && Array.isArray(d.selectedKitchenIds))
          setSelectedKitchenIds(d.selectedKitchenIds);
        if ("selectedCategoryIds" in d && Array.isArray(d.selectedCategoryIds))
          setSelectedCategoryIds(d.selectedCategoryIds);
      } catch (e) {
        console.log("draft load error", e);
      }
    };

    loadDraft();
  }, [draftKey]);

  // ---------- LOAD RECIPE (EDIT MODE) ----------
  const loadRecipe = useCallback(async () => {
    if (!isEdit || !id) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("recipes")
      .select(
        `
        title,
        image_url,
        description,
        kitchen_id,
        author_user_id,
        recipe_ingredients ( ingredient, quantity, unit ),
        recipe_categories ( category_id )
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      console.log("loadRecipe error", error?.message);
      setLoading(false);
      return;
    }

    setTitle((data as any).title ?? "");
    setImageUrl((data as any).image_url ?? null);
    setDescription((data as any).description ?? "");
    setSelectedKitchenIds((data as any).kitchen_id ? [(data as any).kitchen_id] : []);

    const ing = (data as any).recipe_ingredients ?? [];
    setRows(
      ing.length > 0
        ? ing.map((ri: any, idx: number) => ({
            key: String(idx),
            name: ri.ingredient ?? "",
            quantity: ri.quantity != null ? String(ri.quantity) : "",
            unit: ri.unit ?? null,
          }))
        : [{ key: "0", name: "", quantity: "", unit: null }]
    );

    const catRows = (data as any).recipe_categories ?? [];
    setSelectedCategoryIds(catRows.map((x: any) => x.category_id).filter(Boolean));

    setLoading(false);
  }, [id, isEdit]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  useFocusEffect(
    useCallback(() => {
      if (isEdit && id) loadRecipe();
    }, [isEdit, id, loadRecipe])
  );

  // ---------- VALIDATION ----------
  useEffect(() => {
    if (selectedKitchenIds.length > 0) setError(null);
  }, [selectedKitchenIds]);

  // ---------- HANDLERS ----------
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { key: String(Date.now()), name: "", quantity: "", unit: null },
    ]);
  };

  const updateRow = (key: string, patch: Partial<IngredientRow>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const handleSelectUnit = (unit: string) => {
    if (!unitPickerRowKey) return;
    const row = rows.find((r) => r.key === unitPickerRowKey);
    if (!row) return;

    const newQty = convertQuantitySameCategory(row.quantity, row.unit, unit);
    updateRow(unitPickerRowKey, { unit, quantity: newQty });
    setUnitPickerRowKey(null);
  };

  const handleSelectKitchen = (kitchenId: string) => {
    setSelectedKitchenIds([kitchenId]);
    setError(null);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((x) => x !== categoryId) : [...prev, categoryId]
    );
  };

  const addNewCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: trimmed })
      .select("id, name")
      .single();

    if (error) throw new Error(error.message);

    const newCat = data as Category;

    setCategories((prev) => {
      if (prev.some((c) => c.id === newCat.id)) return prev;
      return [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name));
    });
    setSelectedCategoryIds((prev) => (prev.includes(newCat.id) ? prev : [...prev, newCat.id]));
  };

  const pickImage = async () => {
    setError(null);

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (res.canceled) return;

    const uri = res.assets?.[0]?.uri;
    if (!uri) return;

    setSaving(true);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id ?? "anon";

      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${Date.now()}.${fileExt}`;

      const buf = await uriToArrayBuffer(uri);

      const up = await supabase.storage.from("recipe-images").upload(path, buf, {
        contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
        upsert: true,
      });

      if (up.error) throw new Error(up.error.message);

      const pub = supabase.storage.from("recipe-images").getPublicUrl(path);
      setImageUrl(pub.data.publicUrl);
    } catch (e: any) {
      console.log("pickImage error", e?.message ?? e);
      setError("Pildi import ebaõnnestus");
    } finally {
      setSaving(false);
    }
  };

  // ---------- DELETE ----------
  const runDelete = useCallback(async () => {
    if (!id) return;

    setSaving(true);
    setError(null);

    try {
      const delIng = await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);
      if (delIng.error) console.log("DEL recipe_ingredients error:", delIng.error);

      const delCats = await supabase.from("recipe_categories").delete().eq("recipe_id", id);
      if (delCats.error) console.log("DEL recipe_categories error:", delCats.error);

      // If you don't have these tables, keep them - it will just log the error.
      const delRK = await supabase.from("recipe_kitchens").delete().eq("recipe_id", id);
      if (delRK.error) console.log("DEL recipe_kitchens error:", delRK.error);

      const delNotif = await supabase.from("notifications").delete().eq("recipe_id", id);
      if (delNotif.error) console.log("DEL notifications error:", delNotif.error);

      const delRecipe = await supabase.from("recipes").delete().eq("id", id).select("id");
      if (delRecipe.error) {
        console.log("DEL recipes error:", delRecipe.error);
        setError(delRecipe.error.message);
        if (Platform.OS === "web") window.alert(delRecipe.error.message);
        setSaving(false);
        return;
      }

      if (!delRecipe.data || delRecipe.data.length === 0) {
        const msg =
          "Retsepti ei kustutatud (0 rida). Tõenäoliselt RLS/poliitika blokib delete’i.";
        console.log(msg);
        setError(msg);
        if (Platform.OS === "web") window.alert(msg);
        setSaving(false);
        return;
      }

      await AsyncStorage.removeItem(draftKeyEdit(id));
      await AsyncStorage.removeItem(DRAFT_KEY_NEW);

      setSaving(false);
      router.replace("/home");
    } catch (e: any) {
      console.log("DELETE exception:", e?.message ?? e);
      setError("Kustutamine ebaõnnestus");
      if (Platform.OS === "web") window.alert(String(e?.message ?? e));
      setSaving(false);
    }
  }, [id, router]);

  // ---------- DRAFT SAVE ----------
  const scheduleDraftSave = useCallback(() => {
    if (draftTimeout.current) clearTimeout(draftTimeout.current);

    draftTimeout.current = setTimeout(async () => {
      try {
        const payload = {
          imageUrl,
          title,
          servings,
          rows,
          description,
          selectedKitchenIds,
          selectedCategoryIds,
        };
        await AsyncStorage.setItem(draftKey, JSON.stringify(payload));
      } catch (e) {
        console.log("draft save error", e);
      }
    }, 350);
  }, [
    draftKey,
    imageUrl,
    title,
    servings,
    rows,
    description,
    selectedKitchenIds,
    selectedCategoryIds,
  ]);

  useEffect(() => {
    if (loading) return;
    scheduleDraftSave();
    return () => {
      if (draftTimeout.current) clearTimeout(draftTimeout.current);
    };
  }, [scheduleDraftSave, loading]);

  // ---------- DB SAVE (autosave) ----------
  const scheduleDbSave = useCallback(() => {
    if (dbTimeout.current) clearTimeout(dbTimeout.current);

    dbTimeout.current = setTimeout(async () => {
      if (!selectedKitchenId) {
        setError("Primary kitchen missing");
        return;
      }

      setSaving(true);

      const payload: any = {
        title: title.trim() || null,
        image_url: imageUrl,
        description,
        kitchen_id: selectedKitchenId,
        // servings: Number(servings) // only if column exists
      };

      let recipeId = id ?? null;

      // create
      if (!isEdit) {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;

        if (!userId) {
          console.log("insert recipe error: no auth user");
          setError("Pole sisse logitud (userId puudub)");
          setSaving(false);
          return;
        }

        const insertPayload = {
          ...payload,
          author_user_id: userId, // ✅ FIX: required NOT NULL column
        };

        const { data, error } = await supabase
          .from("recipes")
          .insert(insertPayload)
          .select("id")
          .single();

        if (error) {
          console.log("insert recipe error", error.message);
          setSaving(false);
          return;
        }

        recipeId = data?.id ?? null;

        if (recipeId) {
          router.replace({ pathname: "/home/addrecipe", params: { id: recipeId } });
          await AsyncStorage.removeItem(DRAFT_KEY_NEW);
        }
      } else {
        // update
        const { error } = await supabase.from("recipes").update(payload).eq("id", id);
        if (error) {
          console.log("update recipe error", error.message);
          setSaving(false);
          return;
        }
      }

      if (!recipeId) {
        setSaving(false);
        return;
      }

      // ingredients: delete + insert
      await supabase.from("recipe_ingredients").delete().eq("recipe_id", recipeId);

      const ingredientPayload = rows
        .filter((r) => r.name.trim())
        .map((r) => ({
          recipe_id: recipeId,
          ingredient: r.name.trim(),
          quantity: r.quantity ? Number(String(r.quantity).replace(",", ".")) : null,
          unit: r.unit,
        }));

      if (ingredientPayload.length > 0) {
        const { error } = await supabase.from("recipe_ingredients").insert(ingredientPayload);
        if (error) console.log("insert ingredients error", error.message);
      }

      // categories: delete + insert
      await supabase.from("recipe_categories").delete().eq("recipe_id", recipeId);

      if (selectedCategoryIds.length > 0) {
        const catPayload = selectedCategoryIds.map((category_id) => ({
          recipe_id: recipeId,
          category_id,
        }));

        const { error } = await supabase.from("recipe_categories").insert(catPayload);
        if (error) console.log("insert recipe_categories error", error.message);
      }

      setSaving(false);
    }, 650);
  }, [
    rows,
    description,
    imageUrl,
    title,
    selectedKitchenId,
    selectedCategoryIds,
    id,
    isEdit,
    router,
  ]);

  useEffect(() => {
    if (loading) return;
    scheduleDbSave();
    return () => {
      if (dbTimeout.current) clearTimeout(dbTimeout.current);
    };
  }, [scheduleDbSave, loading]);

  // ---------- UI HELPERS ----------
  const selectedCategoryNames = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return selectedCategoryIds.map((cid) => map.get(cid)).filter(Boolean) as string[];
  }, [categories, selectedCategoryIds]);

  // ---------- RENDER ----------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: primaryKitchen?.color ?? "#FFE9A6",
          borderColor: primaryKitchen?.color ?? "#FFE9A6",
        },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* IMAGE */}
        <TouchableOpacity style={styles.imageCard} activeOpacity={0.9} onPress={pickImage}>
          <View style={styles.imagePickButton}>
            <View style={styles.imagePickInner}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
              ) : (
                <Image source={PhotoIcon} style={styles.photoIcon} resizeMode="contain" />
              )}
            </View>
          </View>

          <Text style={styles.imageHint}>(Siia saab importida pilte, ei ole kaamera funktsioon)</Text>
        </TouchableOpacity>

        {/* TITLE */}
        <View style={styles.titleRow}>
          <Text style={styles.titleLabel}>Pealkiri:</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
            placeholder="Nt. Kana pesto pasta"
            placeholderTextColor="#9A9184"
          />
        </View>

        {/* SERVINGS + DELETE */}
        <View style={styles.servingsRow}>
          <View style={styles.servingsLeft}>
            <Text style={styles.servingsLabel}>Valmistamise kogus:</Text>
            <TextInput
              value={servings}
              onChangeText={(t) => setServings(t.replace(/[^\d]/g, "").slice(0, 5))}
              keyboardType="numeric"
              style={styles.qtyInput}
              placeholder="1"
              placeholderTextColor="#9A9184"
              maxLength={5}
            />
          </View>

          {isEdit && (
            <TouchableOpacity
              style={styles.deleteBtn}
              activeOpacity={0.85}
              onPress={() => setDeleteModalVisible(true)}
            >
              <Image source={DeleteIcon} style={styles.deleteIcon} resizeMode="contain" />
            </TouchableOpacity>
          )}
        </View>

        {/* INGREDIENTS TABLE */}
        <IngredientsTable
          rows={rows}
          onChangeRow={updateRow}
          onPressUnit={(key) => setUnitPickerRowKey(key)}
          onAddRow={addRow}
          addIcon={AddIcon}
        />

        {/* DESCRIPTION */}
        <DescriptionCard value={description} onChangeText={setDescription} />

        {/* TAGS & KITCHENS */}
        <View style={styles.pillsRow}>
          <TouchableOpacity
            style={styles.pill}
            activeOpacity={0.85}
            onPress={() => setCategoriesModalVisible(true)}
          >
            <Text style={styles.pillText}>
              {selectedCategoryIds.length > 0
                ? `Märksõnad (${selectedCategoryIds.length})`
                : "Märksõnad"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pill}
            activeOpacity={0.85}
            onPress={() => setKitchenPickerVisible(true)}
          >
            <Text style={styles.pillText}>Köök</Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.saveErrText}>{error}</Text>}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* UNIT PICKER */}
      <UnitPickerForRecipe
        visible={!!unitPickerRowKey}
        initialUnit={rows.find((r) => r.key === unitPickerRowKey)?.unit ?? null}
        onSelect={handleSelectUnit}
        onClose={() => setUnitPickerRowKey(null)}
      />

      {/* CATEGORIES PICKER */}
      <CategoriesPickerModal
        visible={categoriesModalVisible}
        categories={categories}
        selectedIds={selectedCategoryIds}
        onToggle={toggleCategory}
        onAddNew={addNewCategory}
        selectedNames={selectedCategoryNames}
        onClose={() => setCategoriesModalVisible(false)}
      />

      {/* KITCHEN PICKER */}
      <KitchenPickerModal
        visible={kitchenPickerVisible}
        kitchens={kitchens}
        selectedKitchenId={selectedKitchenId}
        onSelect={handleSelectKitchen}
        onClose={() => setKitchenPickerVisible(false)}
      />

      {/* DELETE CONFIRM MODAL */}
      <ConfirmDeleteModal
        visible={deleteModalVisible}
        title={"Oled kindel, et soovid kustutada?"}
        message={"Retsept ja kõik sellega seotud andmed eemaldatakse jäädavalt."}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={async () => {
          setDeleteModalVisible(false);
          await runDelete();
        }}
      />

      {/* SAVING INDICATOR */}
      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator />
          <Text style={styles.savingText}>Salvestan…</Text>
        </View>
      )}

      {/* BOTTOM */}
      <View style={styles.bottomRow}>
        <HomeButton />
        <ProfileButton />
      </View>
    </View>
  );
}

// ------------------------------
// Inline modal: CategoriesPickerModal
// ------------------------------
function CategoriesPickerModal(props: {
  visible: boolean;
  categories: Category[];
  selectedIds: string[];
  selectedNames: string[];
  onToggle: (id: string) => void;
  onAddNew: (name: string) => Promise<void>;
  onClose: () => void;
}) {
  const { visible, categories, selectedIds, selectedNames, onToggle, onAddNew, onClose } = props;

  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setNewName("");
      setBusy(false);
      setLocalErr(null);
    }
  }, [visible]);

  const add = async () => {
    setLocalErr(null);
    const trimmed = newName.trim();
    if (!trimmed) return;

    setBusy(true);
    try {
      await onAddNew(trimmed);
      setNewName("");
    } catch (e: any) {
      console.log("add category error", e?.message ?? e);
      setLocalErr("Ei saanud lisada (võib-olla RLS blokib või nimi juba olemas).");
    } finally {
      setBusy(false);
    }
  };

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        padding: 18,
        zIndex: 998,
      }}
    >
      <Pressable style={{ flex: 1 }} onPress={onClose} />

      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 14,
          maxHeight: "75%",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: "900", color: "#222" }}>Märksõnad</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 14, fontWeight: "900" }}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 10 }} />

        {selectedNames.length > 0 && (
          <Text style={{ fontSize: 12, color: "#444", marginBottom: 10 }}>
            Valitud: {selectedNames.join(", ")}
          </Text>
        )}

        <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 10 }}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="Lisa uus märksõna…"
            placeholderTextColor="#9A9184"
            style={{
              flex: 1,
              height: 36,
              borderWidth: 1,
              borderColor: "#E2D3B8",
              borderRadius: 10,
              paddingHorizontal: 10,
              fontSize: 12,
              backgroundColor: "#fff",
            }}
          />
          <TouchableOpacity
            onPress={add}
            disabled={busy}
            activeOpacity={0.85}
            style={{
              height: 36,
              paddingHorizontal: 12,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#E2D3B8",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "900", color: "#222" }}>
              {busy ? "..." : "Lisa"}
            </Text>
          </TouchableOpacity>
        </View>

        {localErr && (
          <Text style={{ fontSize: 12, color: "#b00020", fontWeight: "700", marginBottom: 8 }}>
            {localErr}
          </Text>
        )}

        <ScrollView>
          <View style={{ gap: 10 }}>
            {categories.map((c) => {
              const active = selectedIds.includes(c.id);
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => onToggle(c.id)}
                  activeOpacity={0.85}
                  style={{
                    borderWidth: 2,
                    borderColor: active ? "#222" : "#E2D3B8",
                    borderRadius: 14,
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    backgroundColor: active ? "rgba(0,0,0,0.04)" : "#fff",
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "900", color: "#222" }}>{c.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={{ height: 10 }} />

        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.85}
          style={{
            borderRadius: 16,
            paddingVertical: 12,
            alignItems: "center",
            borderWidth: 2,
            borderColor: "#E2D3B8",
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "900", color: "#222" }}>Valmis</Text>
        </TouchableOpacity>
      </View>

      <Pressable style={{ flex: 1 }} onPress={onClose} />
    </View>
  );
}
