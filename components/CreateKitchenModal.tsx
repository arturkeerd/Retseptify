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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

      // Create kitchen
      const { data: kitchen, error: kitchenError } = await supabase
        .from("kitchens")
        .insert({
          name: kitchenName.trim(),
          type: "shared",
          owner_user_id: user.id,
          color: "#FFFFFF",
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
            placeholderTextColor="#999"
            style={styles.input}
            editable={!loading}
          />

          <TextInput
            placeholder="Taust"
            placeholderTextColor="#999"
            style={styles.input}
            editable={false}
          />

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
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    width: 280,
    backgroundColor: "#E8E6E1",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "400",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
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
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
  },
  saveButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#C8E6C9",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#5D4037",
  },
});