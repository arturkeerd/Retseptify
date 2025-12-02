import { supabase } from "@/lib/supabase";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type KitchenColorPickerProps = {
  visible: boolean;
  onClose: () => void;
  kitchenId: string;
  kitchenName: string;
  currentColor: string;
  onColorChanged: (newColor: string) => void;
};

// Lihtsalt värvid
const COLORS = [
  "#FFFFFF", // white
  "#FFCDD2", // pink
  "#E1BEE7", // purple
  "#BBDEFB", // light blue
  "#EF5350", // red
  "#FFEB3B", // yellow
  "#FFA726", // orange
  
  "#424242", // dark gray
  "#4CAF50", // green
  "#2196F3", // blue
  "#F5F5F5", // light gray
  "#C8B8A0", // beige
  "#8D6E63", // brown
  "#000000", // black
];

export default function KitchenColorPicker({
  visible,
  onClose,
  kitchenId,
  kitchenName,
  currentColor,
  onColorChanged,
}: KitchenColorPickerProps) {
  const [saving, setSaving] = useState(false);

  const handleColorSelect = async (color: string) => {
    setSaving(true);

    const { error } = await supabase
      .from("kitchens")
      .update({ color: color })
      .eq("id", kitchenId);

    if (error) {
      console.error("Error updating kitchen color:", error);
      Alert.alert("Viga", "Värvi uuendamine ebaõnnestus");
    } else {
      onColorChanged(color);
      onClose();
    }

    setSaving(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
          <Text style={styles.title}>{kitchenName}</Text>
          <Text style={styles.subtitle}>Vali värv</Text>

          <View style={styles.colorGrid}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorBox,
                  { backgroundColor: color },
                  currentColor === color && styles.selectedColor,
                  color === "#FFFFFF" && styles.whiteBox,
                ]}
                onPress={() => handleColorSelect(color)}
                disabled={saving}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={saving}
          >
            <Text style={styles.closeButtonText}>Sulge</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxWidth: 350,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
    justifyContent: "center",
  },
  colorBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  whiteBox: {
    borderColor: "#E0E0E0",
  },
  selectedColor: {
    borderColor: "#5D4037",
    borderWidth: 4,
  },
  closeButton: {
    backgroundColor: "#C8B8A0",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5D4037",
  },
});