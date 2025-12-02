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

          <Text style={styles.label}>Uus nimi</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: 300,
    backgroundColor: "#E8E6E1",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "400",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    height: 45,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  saveButton: {
    width: "100%",
    height: 45,
    backgroundColor: "#FFFFFF",
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "400",
    color: "#333",
  },
});