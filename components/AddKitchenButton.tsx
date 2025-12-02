import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type AddKitchenButtonProps = {
  onPress: () => void;
};

export default function AddKitchenButton({ onPress }: AddKitchenButtonProps) {
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
      <Text style={styles.addButtonText}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 20, 
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
  addButtonText: {
    fontSize: 48,
    color: "#5D4037",
    fontWeight: "300",
  },
});