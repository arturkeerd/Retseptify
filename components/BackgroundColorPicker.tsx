import React from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  currentColor: string;
};

const BACKGROUND_COLORS = [
  "#F5E6D3", // Beige
  "#FFB3BA", // Light Pink
  "#D3D3D3", // Light Gray
  "#A8B5A0", // Sage Green
  "#FF6B6B", // Red
  "#FFE66D", // Yellow
  "#808080", // Gray
  "#90EE90", // Light Green
  "#87CEEB", // Sky Blue
  "#F5F5DC", // Beige (marble-like)
  "#D2B48C", // Tan/Wood
  "#C0C0C0", // Silver/Metal
];

export default function BackgroundColorPicker({
  visible,
  onClose,
  onSelectColor,
  currentColor,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.modal}>
          <View style={styles.colorGrid}>
            {BACKGROUND_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  currentColor === color && styles.selectedColor,
                ]}
                onPress={() => {
                  onSelectColor(color);
                  onClose();
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#4A4A4A",
    borderRadius: 20,
    padding: 20,
    width: 320,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  colorButton: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#FFFFFF",
    borderWidth: 3,
  },
});