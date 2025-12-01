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
            placeholder="vana parool"
            placeholderTextColor="#999"
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
            placeholder="uus parool"
            placeholderTextColor="#999"
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
            placeholder="uus parool"
            placeholderTextColor="#999"
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