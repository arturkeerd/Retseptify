import React from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type ColorPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  currentColor: string;
  colors: string[];
  title?: string;
  subtitle?: string;
  showLoading?: boolean;
};

export default function ColorPickerModal({
  visible,
  onClose,
  onSelectColor,
  currentColor,
  colors,
  title = "Vali värv",
  subtitle,
  showLoading = false,
}: ColorPickerModalProps) {
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
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          <View style={styles.colorGrid}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorBox,
                  { backgroundColor: color },
                  currentColor === color && styles.selectedColor,
                ]}
                onPress={() => {
                  onSelectColor(color);
                  onClose(); 
                }}
                disabled={showLoading}
              />
            ))}
          </View>

          {showLoading && (
            <ActivityIndicator size="small" color="#5D4037" style={styles.loader} />
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={showLoading}
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
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
    justifyContent: "center",
  },
  colorBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#5D4037",
    borderWidth: 4,
  },
  loader: {
    marginBottom: 16,
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