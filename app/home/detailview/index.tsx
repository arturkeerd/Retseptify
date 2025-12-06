// app/home/detailview/index.tsx
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import MinusIcon from "@/assets/images/minus.png";
import PlusIcon from "@/assets/images/plus.png";

import EditButton from "@/components/EditButton";
import HomeButton from "@/components/HomeButton";
import KitchensModal, {
    Kitchen as KitchenType,
} from "@/components/KitchensModal";
import NotificationButton from "@/components/NotificationButton";
import ProfileButton from "@/components/ProfileButton";
import TagsModal from "@/components/TagsModal";

import styles from "./styles";

type DbRecipe = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string | null;
  author_user_id: string | null;

  kitchen:
    | {
        id: string;
        name: string;
        color: string | null;
      }
    | {
        id: string;
        name: string;
        color: string | null;
      }[]
    | null;

  recipe_ingredients: {
    ingredient: string;
    quantity: number | string | null;
    unit: string | null;
  }[];

  recipe_categories: {
    categories:
      | { id: string; name: string }
      | { id: string; name: string }[]
      | null;
  }[];
};

type Ingredient = {
  key: string;
  name: string;
  baseQuantity: number | null;
  baseUnit: string | null;
};

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string | null;
  kitchens: KitchenType[];
  ingredients: Ingredient[];
  tags: string[];
};

// ---- Ühikute helperid ----

const WEIGHT_UNITS = ["kg", "g"] as const;
const SPOON_UNITS = ["tl", "sp"] as const;

const UNIT_TO_BASE: Record<string, number> = {
  g: 1,
  kg: 1000,
  tl: 1,
  sp: 3,
};

function getUnitOptions(baseUnit: string | null): string[] {
  if (!baseUnit) return [];
  const u = baseUnit.toLowerCase();

  if (WEIGHT_UNITS.includes(u as any)) return ["kg", "g"];
  if (SPOON_UNITS.includes(u as any)) return ["tl", "sp"];
  if (u === "tk") return ["tk"];
  return [baseUnit];
}

function convertQuantity(
  baseQty: number | null,
  baseUnit: string | null,
  targetUnit: string | null,
  servings: number
): number | null {
  if (!baseQty || !baseUnit || !targetUnit) return baseQty;

  const from = baseUnit.toLowerCase();
  const to = targetUnit.toLowerCase();

  const isWeight =
    WEIGHT_UNITS.includes(from as any) &&
    WEIGHT_UNITS.includes(to as any);
  const isSpoon =
    SPOON_UNITS.includes(from as any) &&
    SPOON_UNITS.includes(to as any);

  const scaled = baseQty * servings;

  if (!isWeight && !isSpoon) return scaled;

  const fromFactor = UNIT_TO_BASE[from];
  const toFactor = UNIT_TO_BASE[to];
  if (!fromFactor || !toFactor) return scaled;

  const inBase = scaled * fromFactor;
  const converted = inBase / toFactor;
  return converted;
}

function formatQuantity(q: number | null): string {
  if (q == null || Number.isNaN(q)) return "";
  const roundedInt = Math.round(q);
  if (Math.abs(roundedInt - q) < 1e-6) return String(roundedInt);
  return q.toFixed(2).replace(/\.00$/, "");
}

export default function DetailView() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [servings, setServings] = useState(1);
  const [servingsInput, setServingsInput] = useState("1");

  const [unitOverrides, setUnitOverrides] = useState<Record<string, string>>(
    {}
  );

  const [isIngredientsExpanded, setIsIngredientsExpanded] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const [isChef, setIsChef] = useState(false);

  const [tagsModalVisible, setTagsModalVisible] = useState(false);
  const [kitchensModalVisible, setKitchensModalVisible] = useState(false);

  // --- Lae retsept ---
  useEffect(() => {
    if (!id) {
      setError("Retsepti ID puudub");
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("recipes")
        .select(
          `
          id,
          description,
          image_url,
          created_at,
          author_user_id,
          kitchen: kitchens!recipes_kitchen_id_fkey (
            id,
            name,
            color
          ),
          recipe_ingredients (
            ingredient,
            quantity,
            unit
          ),
          recipe_categories (
            categories ( id, name )
          )
        `
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error loading recipe:", error);
        setError(error?.message ?? "Retsepti ei leitud");
        setLoading(false);
        return;
      }

      const db = data as DbRecipe;

      // kas praegune kasutaja on autor?
      const { data: auth } = await supabase.auth.getUser();
      const currentUserId = auth.user?.id ?? null;
      const userIsAuthor =
        !!currentUserId &&
        !!db.author_user_id &&
        db.author_user_id === currentUserId;
      setIsChef(userIsAuthor);

      // tags
      const tags =
        db.recipe_categories?.flatMap((rc) => {
          const cat = rc.categories;
          if (!cat) return [];
          return Array.isArray(cat) ? cat.map((c) => c.name) : [cat.name];
        }) ?? [];

      // köögid (hetkel üks, aga valmis mitmeks)
      const kField = db.kitchen;
      let kitchens: KitchenType[] = [];
      if (Array.isArray(kField)) {
        kitchens = kField.map((k) => ({
          id: String(k.id),
          name: String(k.name),
          color: k.color,
        }));
      } else if (kField) {
        kitchens = [
          {
            id: String(kField.id),
            name: String(kField.name),
            color: kField.color,
          },
        ];
      }

      // koostisosad
      const ingredients: Ingredient[] =
        db.recipe_ingredients?.map((ri, idx) => {
          let baseQuantity: number | null = null;
          if (typeof ri.quantity === "number") {
            baseQuantity = ri.quantity;
          } else if (typeof ri.quantity === "string") {
            const n = parseFloat(ri.quantity);
            baseQuantity = Number.isNaN(n) ? null : n;
          }

          return {
            key: `${ri.ingredient}-${idx}`,
            name: ri.ingredient,
            baseQuantity,
            baseUnit: ri.unit,
          };
        }) ?? [];

      const mapped: Recipe = {
        id: db.id,
        title: db.title,
        description: db.description,
        imageUrl:
          db.image_url && db.image_url !== "NULL" ? db.image_url : null,
        createdAt: db.created_at,
        kitchens,
        ingredients,
        tags,
      };

      setRecipe(mapped);
      setServings(1);
      setServingsInput("1");
      setIsIngredientsExpanded(false);
      setIsDescriptionExpanded(false);
      setLoading(false);
    };

    load();
  }, [id]);

  const primaryKitchen = recipe?.kitchens[0] ?? null;
  const bgColor = primaryKitchen?.color ?? "#FFE9A6";

  const computedIngredients = useMemo(() => {
    if (!recipe) return [];

    return recipe.ingredients.map((ing) => {
      const baseUnit = ing.baseUnit;
      const selectedUnit =
        unitOverrides[ing.key] ??
        (baseUnit ? baseUnit.toLowerCase() : null);

      const qty = convertQuantity(
        ing.baseQuantity,
        baseUnit,
        selectedUnit,
        servings
      );

      return {
        ...ing,
        displayQuantity: formatQuantity(qty),
        displayUnit: selectedUnit ?? baseUnit ?? "",
      };
    });
  }, [recipe, unitOverrides, servings]);

  const handleChangeServingsBy = (delta: number) => {
    setServings((prev) => {
      const next = Math.max(1, prev + delta);
      setServingsInput(String(next));
      return next;
    });
  };

  const handleServingsInputChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setServingsInput(cleaned);
    if (!cleaned) return;
    const n = parseInt(cleaned, 10);
    if (!Number.isNaN(n) && n >= 1) {
      setServings(n);
    }
  };

  const handleToggleUnit = (ingredient: Ingredient) => {
    const baseUnit = ingredient.baseUnit;
    if (!baseUnit) return;

    const options = getUnitOptions(baseUnit);
    if (options.length <= 1) return;

    const current = unitOverrides[ingredient.key] ?? baseUnit;
    const idx = options.indexOf(current);
    const next = options[(idx + 1 + options.length) % options.length];

    setUnitOverrides((prev) => ({
      ...prev,
      [ingredient.key]: next,
    }));
  };

  const kitchenButtonLabel =
    recipe && recipe.kitchens.length === 1
      ? recipe.kitchens[0].name
      : "Köögid";

  // Väline scroll: kui vähemalt üks kaart on lahti
  const pageScrollEnabled = isIngredientsExpanded || isDescriptionExpanded;

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: bgColor }]}>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={[styles.root, { backgroundColor: bgColor }]}>
        <View style={styles.center}>
          <Text>{error ?? "Retsepti ei leitud"}</Text>
        </View>
      </View>
    );
  }

  const renderCardsAndButtons = () => {
    const ingredientRows = computedIngredients.map((ing) => (
      <View key={ing.key} style={styles.ingredientRow}>
        <Text style={styles.ingredientName}>{ing.name}</Text>
        <View style={styles.ingredientRight}>
          <Text style={styles.ingredientQty}>{ing.displayQuantity}</Text>
          <TouchableOpacity
            style={styles.unitButton}
            activeOpacity={0.8}
            onPress={() =>
              handleToggleUnit({
                key: ing.key,
                name: ing.name,
                baseQuantity: ing.baseQuantity,
                baseUnit: ing.baseUnit,
              })
            }
          >
            <Text style={styles.unitButtonText}>
              {ing.displayUnit || ing.baseUnit || "-"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ));

    return (
      <>
        {/* TOORAINE KAART */}
        <View style={styles.card}>
          <View style={styles.servingsHeaderRow}>
            <View style={styles.servingsLeft}>
              <Text style={styles.servingsLabel}>Valmistamise kogus:</Text>
              <View style={styles.servingsControl}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleChangeServingsBy(-1)}
                >
                  <View style={styles.servingsIconWrapper}>
                    <Image source={MinusIcon} style={styles.servingsIcon} />
                  </View>
                </TouchableOpacity>

                <TextInput
                  style={styles.servingsInput}
                  value={servingsInput}
                  onChangeText={handleServingsInputChange}
                  keyboardType="numeric"
                />

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleChangeServingsBy(1)}
                >
                  <View style={styles.servingsIconWrapper}>
                    <Image source={PlusIcon} style={styles.servingsIcon} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <Text
              style={styles.showAll}
              onPress={() =>
                setIsIngredientsExpanded((prev) => !prev)
              }
            >
              {isIngredientsExpanded ? "Peida" : "Kuva kõik"}
            </Text>
          </View>

          {/* Koostisosad */}
          {isIngredientsExpanded ? (
            // LAHTI: täis list, ilma maxHeightita ja ilma sisemise scrollita
            <View style={styles.ingredientsList}>
              {ingredientRows}
            </View>
          ) : (
            // KINNI: maxHeight + alati sisemine scroll
            <View style={styles.ingredientsListCollapsed}>
              <ScrollView
                style={styles.innerScroll}
                showsVerticalScrollIndicator={true}
              >
                {ingredientRows}
              </ScrollView>
            </View>
          )}
        </View>

        {/* KIRJELDUSE KAART */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Kirjeldus</Text>
            <Text
              style={styles.showAll}
              onPress={() =>
                setIsDescriptionExpanded((prev) => !prev)
              }
            >
              {isDescriptionExpanded ? "Peida" : "Kuva kõik"}
            </Text>
          </View>

          {isDescriptionExpanded ? (
            // LAHTI: kogu tekst
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>
                {recipe.description || "Kirjeldus puudub."}
              </Text>
            </View>
          ) : (
            // KINNI: maxHeight + alati sisemine scroll
            <View style={styles.descriptionCollapsed}>
              <ScrollView
                style={styles.innerScroll}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.descriptionText}>
                  {recipe.description || "Kirjeldus puudub."}
                </Text>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Märksõnad & Köögid nupud */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 4,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
              elevation: 3,
            }}
            onPress={() => setTagsModalVisible(true)}
          >
            <Text style={{ fontSize: 14, fontWeight: "500" }}>
              Märksõnad
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
              elevation: 3,
            }}
            onPress={() => setKitchensModalVisible(true)}
          >
            <Text style={{ fontSize: 14, fontWeight: "500" }}>
              {kitchenButtonLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      {/* Ülemine ala: pilt + pealkiri */}
      <View style={styles.headerArea}>
        <View style={styles.imageContainer}>
          {recipe.imageUrl ? (
            <Image
              source={{ uri: recipe.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholderInner}>
              <Text style={styles.imagePlaceholderText}>PILT</Text>
            </View>
          )}
        </View>

        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{recipe.title}</Text>
          </View>
        </View>
      </View>

      {/* Kaardid + nupud: väline scroll ainult siis, kui vähemalt üks kaart on lahti */}
      {pageScrollEnabled ? (
        <ScrollView
          style={styles.cardsScroll}
          contentContainerStyle={styles.cardsScrollContent}
          showsVerticalScrollIndicator={true}
        >
          {renderCardsAndButtons()}
          <View style={{ height: 140 }} />
        </ScrollView>
      ) : (
        <View style={styles.cardsScrollContent}>
          {renderCardsAndButtons()}
        </View>
      )}

      {/* Märksõnade modaal (view) */}
      <TagsModal
        visible={tagsModalVisible}
        mode="view"
        tags={recipe.tags}
        onClose={() => setTagsModalVisible(false)}
      />

      {/* Köökide modaal (view) */}
      <KitchensModal
        visible={kitchensModalVisible}
        mode="view"
        kitchens={recipe.kitchens}
        onClose={() => setKitchensModalVisible(false)}
      />

      {/* Alumine rida: Edit / Chat + Home + Profiil */}
      <View style={styles.bottomBar}>
        {isChef ? <EditButton recipeId={recipe.id} /> : <NotificationButton />}
        <HomeButton />
        <ProfileButton />
      </View>
    </View>
  );
}
