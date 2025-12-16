import AddIcon from "@/assets/images/add.png";
import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

type AddKitchenButtonProps = {
  onPress: () => void;
};

export default function AddKitchenButton({ onPress }: AddKitchenButtonProps) {
  return (
   <TouchableOpacity style={styles.addButton} onPress={onPress}>
  <Image source={AddIcon} style={styles.addButtonImage} />
</TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addButton: {
  width: 100,
  height: 100,
},
addButtonImage: {
  width: 100,
  height: 100,
  resizeMode: 'contain',
},
});