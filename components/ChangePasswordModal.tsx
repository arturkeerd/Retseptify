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
  View
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ChangePasswordModal({ visible, onClose }: Props) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async () => {
    setErrorMessage("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Kõik väljad peavad olema täidetud");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Uued paroolid ei kattu");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Parool peab olema vähemalt 6 tähemärki pikk");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        Alert.alert("Õnnestus!", "Parool edukalt muudetud!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrorMessage("");
        onClose();
      }
    } catch (err: any) {
      setErrorMessage("Midagi läks valesti");
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
          <Text style={styles.title}>Muuda parool</Text>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TextInput
            value={oldPassword}
            onChangeText={(text) => {
              setOldPassword(text);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder="Vana parool"
            placeholderTextColor="#393939"
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
            editable={!loading}
          />

          <TextInput
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder="Uus parool"
            placeholderTextColor="#393939"
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
            editable={!loading}
          />

          <TextInput
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder="Uus parool"
            placeholderTextColor="#393939"
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
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
  width: 356,
  backgroundColor: "#e7e7e7ff",
  borderRadius: 24,
  padding: 20,
  paddingTop: 40,
  alignItems: "center",
  zIndex: 1,
},
  title: {
  fontSize: 40,
  fontWeight: "600",
  marginBottom: 40,
  textAlign: "center",
  color: "#333",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    textAlign: "center"
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