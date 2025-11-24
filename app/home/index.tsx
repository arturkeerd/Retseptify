// app/home/index.tsx
import { FilterRecipes } from "@/components/FilterRecipes";
import RecipeListItem from "@/components/RecipeListItem";
import { SortMode, SortRecipes } from "@/components/SortRecipes";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./styles";

type DbRecipe = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string | null;
  kitchens: {
    id: string;
    name: string;
    type: string;
  }[];
  recipe_categories: {
    categories:
      | { id: string; name: string }
      | { id: string; name: string }[]
      | null;
  }[];
  recipe_ingredients: {
    ingredient: string;
  }[];
};

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  kitchenName: string | null;
  tags: string[];
  ingredients: string[];
  createdAt: string | null;
};

export default function Home() {
    const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

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
            ingredient
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
        (data as DbRecipe[] | null)?.map((r) => {
          const kitchen =
            r.kitchens && r.kitchens.length > 0 ? r.kitchens[0] : null;

          const tags =
            r.recipe_categories?.flatMap((rc) => {
              const cat = rc.categories;
              if (!cat) return [];
              if (Array.isArray(cat)) {
                return cat.map((c) => c.name);
              }
              return [cat.name];
            }) ?? [];

          const ingredients =
            r.recipe_ingredients?.map((ri) => ri.ingredient) ?? [];

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
        }) ?? [];

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

    // otsing
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => r.title.toLowerCase().includes(q));
    }

    // köögifilter
    if (selectedKitchens.length > 0) {
      list = list.filter(
        (r) =>
          r.kitchenName && selectedKitchens.includes(r.kitchenName as string)
      );
    }

    // märksõnad – AND loogika (kõik valitud tagid peavad retseptis olema)
    if (selectedTags.length > 0) {
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

  // --- Filtri handlerid ---
  const handleClearFilters = () => {
    setSelectedKitchens([]);
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

  const handleSelectAllKitchens = () => {
    setSelectedKitchens(allKitchens);
  };

  const handleSelectAllTags = () => {
    setSelectedTags(allTags);
  };

  return (
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

      {/* RETSEPTIDE LIST */}
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
      />

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
            onPress={() => router.push("/home/user")}>
            <Text style={styles.circleButtonText}>P</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ujuv + nupp */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => console.log("Add recipe pressed")}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* FILTRI OVERLAY */}
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
        onSelectAllKitchens={handleSelectAllKitchens}
        onSelectAllTags={handleSelectAllTags}
      />

      {/* SORTEERIMISE OVERLAY */}
      <SortRecipes
        visible={sortVisible}
        onClose={() => setSortVisible(false)}
        sortMode={sortMode}
        onChangeSortMode={setSortMode}
      />
    </View>
  );
}
