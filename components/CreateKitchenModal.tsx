import ColorPickerModal from "@/components/ColorPickerModal";
import { APP_COLORS } from "@/components/colors";
import { supabase } from "@/lib/supabase";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type CreateKitchenModalProps = {
  visible: boolean;
  onClose: () => void;
  onKitchenCreated: () => void;
};

export default function CreateKitchenModal({
  visible,
  onClose,
  onKitchenCreated,
}: CreateKitchenModalProps) {
  const [kitchenName, setKitchenName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const handleCreate = async () => {
    setErrorMessage("");

    if (!kitchenName.trim()) {
      setErrorMessage("Köögi nimi ei tohi olla tühi");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage("Sa ei ole sisse logitud");
        setLoading(false);
        return;
      }

      // Create kitchen with selected color
      const { data: kitchen, error: kitchenError } = await supabase
        .from("kitchens")
        .insert({
          name: kitchenName.trim(),
          type: "shared",
          owner_user_id: user.id,
          color: selectedColor,
        })
        .select()
        .single();

      if (kitchenError) throw kitchenError;

      // Add user as owner in kitchen_members
      const { error: memberError } = await supabase
        .from("kitchen_members")
        .insert({
          kitchen_id: kitchen.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      Alert.alert("Õnnestus!", "Köök edukalt loodud!");
      setKitchenName("");
      setSelectedColor("#FFFFFF");
      onKitchenCreated();
      onClose();
    } catch (error: any) {
      console.error("Error creating kitchen:", error);
      setErrorMessage(error.message || "Midagi läks valesti");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modal}>
          <Text style={styles.title}>Loo köök</Text>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TextInput
            value={kitchenName}
            onChangeText={(text) => {
              setKitchenName(text);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder="Nimi"
            placeholderTextColor="#393939"
            style={styles.input}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.input, styles.colorInput, { backgroundColor: selectedColor }]}
            onPress={() => setColorPickerVisible(true)}
            disabled={loading}
          >
            <Text style={styles.colorInputText}>Taust</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleCreate}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#5D4037" />
            ) : (
              <Text style={styles.saveButtonText}>Salvesta</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Color Picker Modal */}
      <ColorPickerModal
        visible={colorPickerVisible}
        onClose={() => setColorPickerVisible(false)}
        onSelectColor={setSelectedColor}
        currentColor={selectedColor}
        colors={APP_COLORS}
        title="Vali köögi värv"
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    width: 357,
    backgroundColor: "#e7e7e7ff",
    borderRadius: 24,
    padding: 50,
    alignItems: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 45,
    fontWeight: "600",
    marginBottom: 40,
    textAlign: "center",
    color: "#393939",
    textDecorationLine: "underline",
  },
  errorContainer: {
    width: "100%",
    backgroundColor: "#FFCDD2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  input: {
    width: "70%",
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 24,
    fontSize: 20,
    marginBottom: 20,
    color: "#1d1b1bff",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  colorInput: {
    justifyContent: "center",
  },
  colorInputText: {
  fontSize: 20,
  color: "#393939",
  textAlign: "center",
},
  saveButton: {
    width: "70%",
    height: 60,
    backgroundColor: "#C8E6C9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 40,
    fontWeight: "500",
    color: "#5D4037",
  },
});