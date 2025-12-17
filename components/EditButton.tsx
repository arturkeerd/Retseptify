import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

const router = useRouter();


type Props = {
  recipeId: string;
};

export default function EditButton({ recipeId }: Props) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/home/addrecipe",
      params: { recipeId },
    });
  };

  return (
    <TouchableOpacity style={styles.iconButton} onPress={handlePress}>
      <Image
        source={require("@/assets/images/edit.png")}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(169, 149, 108, 0.75)",
    borderWidth: 3,
    borderColor: "#5D4037",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
});
