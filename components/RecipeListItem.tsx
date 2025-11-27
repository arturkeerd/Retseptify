import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { router } from "expo-router";
import ArrowIcon from "../assets/images/arrow.png";

type RecipeIngredient = {
  name: string;
  quantity: string | null;
  unit: string | null;
};

type Recipe = {
  id: string;
  title: string;
  imageUrl: string | null;
  ingredients: RecipeIngredient[];
};

type Props = {
  recipe: Recipe;
  isExpanded?: boolean;
  onPress?: () => void; // kaardi enda klikk (expand/collapse)
};

export const RecipeListItem: React.FC<Props> = ({
  recipe,
  isExpanded = false,
  onPress,
}) => {
  const maxIngredientsToShow = 5;
  const visibleIngredients = recipe.ingredients.slice(0, maxIngredientsToShow);
  const hasMoreIngredients = recipe.ingredients.length > maxIngredientsToShow;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.container, isExpanded && styles.containerExpanded]}>
        {/* Peamine rida – retsepti nimi */}
        <Text style={styles.title} numberOfLines={1}>
          {recipe.title}
        </Text>

        {/* Kui on avatud olekus, näitame “laiendatud” osa */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Koostisosad */}
            <View style={styles.ingredientsBox}>
              <Text style={styles.ingredientsTitle}>Koostisosad</Text>
              {visibleIngredients.map((ing, idx) => {
                const qtyPart =
                  ing.quantity && ing.unit
                    ? `${ing.quantity} ${ing.unit}`
                    : ing.quantity || ing.unit || "";

                return (
                  <Text key={idx} style={styles.ingredientsLine}>
                    {/* nime osa */}• {ing.name}
                    {/* kui on mingi kogus/ühik, lisame vahe ja numbri */}
                    {qtyPart ? ` ${qtyPart}` : ""}
                  </Text>
                );
              })}
              {hasMoreIngredients && (
                <Text style={styles.ingredientsMore}>…</Text>
              )}
            </View>

            {/* Pilt + nool overlay */}
            <View style={styles.imageWrapper}>
              <View style={styles.imageContainer}>
                {recipe.imageUrl ? (
                  <Image
                    source={{ uri: recipe.imageUrl }}
                    style={styles.image}
                  />
                ) : (
                  <View style={styles.imagePlaceholderInner}>
                    <Text style={styles.imageText}>PILT</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.arrowCircle}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/home/detailview",
                    params: { id: recipe.id },
                  })
                }
              >
                <Image source={ArrowIcon} style={styles.arrowImage} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

type Styles = {
  container: ViewStyle;
  containerExpanded: ViewStyle;
  title: TextStyle;
  expandedContent: ViewStyle;
  ingredientsBox: ViewStyle;
  ingredientsTitle: TextStyle;
  ingredientsLine: TextStyle;
  ingredientsMore: TextStyle;
  imageWrapper: ViewStyle;
  imageContainer: ViewStyle;
  image: ImageStyle;
  imagePlaceholderInner: ViewStyle;
  imageText: TextStyle;
  arrowCircle: ViewStyle;
  arrowImage: ImageStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 8,
    backgroundColor: "#4F6B60",
      // Drop shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,

    // Drop shadow (Android)
    elevation: 5,
  },
  containerExpanded: {
    backgroundColor: "#FFE9A6",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  expandedContent: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ingredientsBox: {
    flex: 1,
  },
  ingredientsTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  ingredientsLine: {
    fontSize: 12,
  },
  ingredientsMore: {
    fontSize: 12,
    fontWeight: "600",
  },

  // --- pilt + nool ---
  imageWrapper: {
    width: 140,
    height: 100,
    position: "relative",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#ccc",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholderInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    fontSize: 12,
  },
  arrowCircle: {
    position: "absolute",
    right: 6,
    top: "50%",
    transform: [{ translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden", // et pilt jääks ringi sisse
    alignItems: "center",
    justifyContent: "center",
  },
  arrowImage: {
    width: "100%", // täida kogu ring
    height: "100%",
    resizeMode: "cover", // või "contain", kui nii parem näeb
  },
});

export default RecipeListItem;
