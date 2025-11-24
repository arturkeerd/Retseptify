// app/home/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import styles from "./styles";
import RecipeListItem from "@/components/RecipeListItem";
import { FilterRecipes } from "@/components/FilterRecipes";
import { SortRecipes, SortMode } from "@/components/SortRecipes";

type DbRecipe = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string | null;

  kitchens:
    | {
        id: string;
        name: string;
        type: string;
      }
    | {
        id: string;
        name: string;
        type: string;
      }[]
    | null;

  recipe_categories: {
    categories:
      | { id: string; name: string }
      | { id: string; name: string }[]
      | null;
  }[];

  recipe_ingredients: {
    ingredient: string;
    quantity: string | null;
    unit: string | null;
  }[];
};

type RecipeIngredient = {
  name: string;
  quantity: string | null;
  unit: string | null;
};

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  kitchenName: string | null;
  tags: string[];
  ingredients: RecipeIngredient[];
  createdAt: string | null;
};

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [profileAvatar, setProfileAvatar] = useState<{
  initial: string;
  imageUrl: string | null;
} | null>(null);

  // overlay state
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);

  // filtrid
  const [selectedKitchens, setSelectedKitchens] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // sorteerimine
  const [sortMode, setSortMode] = useState<SortMode>("NEWEST");

  // --- Laeme retseptid Supabasest koos seostega ---
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("recipes")
        .select(
          `
          id,
          title,
          description,
          image_url,
          created_at,
          kitchens ( id, name, type ),
          recipe_categories (
            categories ( id, name )
          ),
recipe_ingredients (
  ingredient,
  quantity,
  unit
)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading recipes:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

const mapped: Recipe[] =
  (data ?? []).map((raw) => {
    const r = raw as DbRecipe;

    let kitchen: { id: string; name: string; type: string } | null = null;

    const kField = r.kitchens;
    if (Array.isArray(kField)) {
      kitchen = kField[0] ?? null;
    } else if (kField && typeof kField === "object") {
      kitchen = kField;
    }

    const tags =
      r.recipe_categories?.flatMap((rc) => {
        const cat = rc.categories;
        if (!cat) return [];
        if (Array.isArray(cat)) {
          return cat.map((c) => c.name);
        }
        return [cat.name];
      }) ?? [];

    // --- Koostisosad ---
const ingredients =
  r.recipe_ingredients?.map((ri) => ({
    name: ri.ingredient,
    quantity: ri.quantity,
    unit: ri.unit,
  })) ?? [];


    return {
      id: r.id,
      title: r.title,
      description: r.description,
      imageUrl:
        r.image_url && r.image_url !== "NULL" ? r.image_url : null,
      kitchenName: kitchen?.name ?? null,
      tags,
      ingredients,
      createdAt: r.created_at,
    };
  });

      setRecipes(mapped);

      // algne köögifilter – kõik köögid valitud
      const initialKitchens = Array.from(
        new Set(
          mapped
            .map((r) => r.kitchenName)
            .filter((name): name is string => !!name)
        )
      );
      setSelectedKitchens(initialKitchens);

      setLoading(false);
    };

    load();
  }, []);


  useEffect(() => {
  const loadAvatar = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return;

    const { data, error } = await supabase
      .from("users")
      .select("username, profile_image_url")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      console.error("Error loading avatar:", error);
      return;
    }

    const username: string = data.username;
    const initial = username.charAt(0).toUpperCase();

    setProfileAvatar({
      initial,
      imageUrl: data.profile_image_url ?? null,
    });
  };

  loadAvatar();
}, []);

  // kõik köögid, mis retseptide seast tulevad
  const allKitchens = useMemo(() => {
    const s = new Set<string>();
    recipes.forEach((r) => {
      if (r.kitchenName) s.add(r.kitchenName);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [recipes]);

  // kõik tagid (kategoriad)
  const allTags = useMemo(() => {
    const s = new Set<string>();
    recipes.forEach((r) => {
      r.tags.forEach((t) => s.add(t));
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [recipes]);

  // filtrid + otsing + sorteerimine
  const visibleRecipes = useMemo(() => {
    let list = [...recipes];

const q = search.trim().toLowerCase();
if (q) {
  // luba eraldada nii tühikutega kui ka komadega
  const terms = q
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (terms.length > 0) {
    list = list.filter((r) => {
      const title = (r.title || "").toLowerCase();

      // toetame nii string- kui objekt-kujul koostisosi
      const ingredientNames = (r.ingredients || []).map((ing: any) =>
        typeof ing === "string"
          ? ing.toLowerCase()
          : (ing.name || "").toLowerCase()
      );

      const tagNames = (r.tags || []).map((t) => t.toLowerCase());

      // iga otsingusõna peab leiduma kas nimes, koostisosades või märksõnades
      return terms.every((term) => {
        if (!term) return true;

        const inTitle = title.includes(term);
        const inIngredients = ingredientNames.some((name) =>
          name.includes(term)
        );
        const inTags = tagNames.some((tag) => tag.includes(term));

        return inTitle || inIngredients || inTags;
      });
    });
  }
}

    // köögifilter
if (
  selectedKitchens.length > 0 &&
  selectedKitchens.length < allKitchens.length
) {
  list = list.filter(
    (r) => r.kitchenName && selectedKitchens.includes(r.kitchenName)
  );
}

    // märksõnad – AND loogika (kõik valitud tagid peavad retseptis olema)
if (selectedTags.length > 0 && selectedTags.length < allTags.length) {
  list = list.filter((r) =>
    selectedTags.every((t) => r.tags.includes(t))
  );
}

    // sorteerimine
    list.sort((a, b) => {
      switch (sortMode) {
        case "TITLE_AZ":
          return a.title.localeCompare(b.title);

        case "TITLE_ZA":
          return b.title.localeCompare(a.title);

        case "KITCHEN_AZ": {
          const ka = a.kitchenName ?? "";
          const kb = b.kitchenName ?? "";
          const diff = ka.localeCompare(kb);
          if (diff !== 0) return diff;
          return a.title.localeCompare(b.title);
        }

        case "KITCHEN_ZA": {
          const ka = a.kitchenName ?? "";
          const kb = b.kitchenName ?? "";
          const diff = kb.localeCompare(ka);
          if (diff !== 0) return diff;
          return b.title.localeCompare(a.title);
        }

        case "OLDEST": {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return da - db;
        }

        case "NEWEST":
        default: {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        }
      }
    });

    return list;
  }, [recipes, search, selectedKitchens, selectedTags, sortMode]);

const handleClearFilters = () => {
  setSelectedTags([]);
};

  const toggleKitchen = (name: string) => {
    setSelectedKitchens((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSelectAllTags = () => {
    setSelectedTags(allTags);
  };

return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
    keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
  >
    <View style={styles.container}>
      {/* HEADER – Filtreeri / Sorteeri */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setFilterVisible(true)}
        >
          <Text style={styles.headerButtonText}>Filtreeri</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setSortVisible(true)}
        >
          <Text style={styles.headerButtonText}>Sorteeri</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 16 }} />

      {error && <Text>{error}</Text>}
      {loading && <Text>Laen retsepte…</Text>}

      <FlatList
        data={visibleRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <RecipeListItem
            recipe={item}
            isExpanded={expandedId === item.id}
            onPress={() =>
              setExpandedId((prev) => (prev === item.id ? null : item.id))
            }
          />
        )}
        keyboardShouldPersistTaps="handled"
      />

      {/* FOOTER – Search + profiil */}
{/* FOOTER – Search + profiil */}
<View style={styles.footer}>
  <View style={styles.searchBox}>
    <TextInput
      value={search}
      onChangeText={setSearch}
      placeholder="Search"
      style={styles.searchInput}
    />
  </View>

  <View style={styles.footerRight}>
    <TouchableOpacity
      style={styles.circleButton}
      activeOpacity={0.8}
      onPress={() => router.push("/home/user")}
    >
      {profileAvatar?.imageUrl ? (
        <Image
          source={{ uri: profileAvatar.imageUrl }}
          style={{ width: "100%", height: "100%", borderRadius: 999 }}
        />
      ) : (
        <Text style={styles.circleButtonText}>
          {profileAvatar?.initial ?? "P"}
        </Text>
      )}
    </TouchableOpacity>
  </View>
</View>

      {/* + nupp, FilterRecipes, SortRecipes jne */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => console.log("Add recipe pressed")}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <FilterRecipes
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        allKitchens={allKitchens}
        allTags={allTags}
        selectedKitchens={selectedKitchens}
        selectedTags={selectedTags}
        onClearAll={handleClearFilters}
        onToggleKitchen={toggleKitchen}
        onToggleTag={toggleTag}
        onSelectAllTags={handleSelectAllTags}
      />

      <SortRecipes
        visible={sortVisible}
        onClose={() => setSortVisible(false)}
        sortMode={sortMode}
        onChangeSortMode={setSortMode}
      />
    </View>
  </KeyboardAvoidingView>
);

}
