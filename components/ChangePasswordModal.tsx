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
};

export default function ChangePasswordModal({ visible, onClose }: Props) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Viga", "Kõik väljad peavad olema täidetud");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Viga", "Uued paroolid ei kattu");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Viga", "Parool peab olema vähemalt 6 tähemärki pikk");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Error updating password:", error);
      Alert.alert("Viga", error.message);
    } else {
      Alert.alert("Edu", "Parool edukalt muudetud!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Muuda parool</Text>

          <Text style={styles.label}>Vana parool</Text>
          <TextInput
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Vana parool"
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Uus parool</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Uus parool"
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Uuesti uus parool</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Uuesti uus parool"
            secureTextEntry
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
    marginBottom: 15,
  },
  saveButton: {
    width: "100%",
    height: 45,
    backgroundColor: "#FFFFFF",
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
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