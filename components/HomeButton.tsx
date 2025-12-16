import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

export default function HomeButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.iconButton}
      onPress={() => router.push("/home")}
    >
      <Image 
        source={require("@/assets/images/Home.png")} 
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
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
},
  icon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
});