import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

type Recipe = {
  id: string;
  title: string;
  // hiljem saad siia lisada kitchenName, image_url, tags jne
};

type Props = {
  recipe: Recipe;
  isExpanded?: boolean;
  onPress?: () => void;
};

export const RecipeListItem: React.FC<Props> = ({
  recipe,
  isExpanded = false,
  onPress,
}) => {
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
            {/* Placeholder – hiljem seome päris pildi ja koostisosad */}
            <View style={styles.ingredientsBox}>
              <Text style={styles.ingredientsTitle}>Koostisosad (demo)</Text>
              <Text style={styles.ingredientsLine}>• muna</Text>
              <Text style={styles.ingredientsLine}>• suhkur</Text>
              <Text style={styles.ingredientsLine}>• šokolaad</Text>
            </View>

            <View style={styles.imageAndArrow}>
              {/* Demo pildi asemel saad hiljem panna recipe.image_url */}
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageText}>PILT</Text>
              </View>
              <View style={styles.arrowCircle}>
                <Text style={styles.arrowText}>{">"}</Text>
              </View>
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
  imageAndArrow: ViewStyle;
  imagePlaceholder: ViewStyle;
  imageText: TextStyle;
  arrowCircle: ViewStyle;
  arrowText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: "#4F6B60", // roheline kast Figma järgi-ish
  },
  containerExpanded: {
    backgroundColor: "#FFE9A6", // kollane kui avatud
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  expandedContent: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
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
  imageAndArrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    fontSize: 12,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#C48C5B",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 18,
    fontWeight: "700",
  },
});

export default RecipeListItem;
