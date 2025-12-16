import { supabase } from "@/lib/supabase";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  onNameChanged: (newName: string) => void;
};

export default function ChangeNameModal({
  visible,
  onClose,
  currentName,
  onNameChanged,
}: Props) {
  const [newName, setNewName] = useState("");

  const handleSave = async () => {
    if (newName.trim() === "") {
      Alert.alert("Viga", "Nimi ei saa olla tühi");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Viga", "Kasutaja ei ole sisse loginud");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ username: newName.trim() })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating name:", error);
      Alert.alert("Viga", error.message);
    } else {
      onNameChanged(newName.trim());
      setNewName("");
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Muuda nimi</Text>

          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder={currentName}
            style={styles.input}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvesta</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
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
  modal: {
    width: 357,
    backgroundColor: "#e7e7e7ff",
    borderRadius: 24,
    padding: 50,
    alignItems: "center",
  },
  title: {
    fontSize: 45,
    fontWeight: "600",
    marginBottom: 40,
    textAlign: "center",
    color: "#393939",
    textDecorationLine: "underline",
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
  saveButtonText: {
    fontSize: 40,
    fontWeight: "500",
    color: "#5D4037",
  },
});