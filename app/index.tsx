import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";
import RegisterModal from "../components/RegisterModal";
import { loginWithEmail } from "../hooks/useAuth";
import { styles } from "./styles";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  async function onLogin() {
  setBusy(true);
  setError(null);
  const res = await loginWithEmail(email.trim(), password);
  setBusy(false);
  if (!res.ok) {
    setError(res.error);
    return;
  }
  
  // Check for pending invite
  const pendingToken = await AsyncStorage.getItem("pending_invite_token");
  if (pendingToken) {
    await AsyncStorage.removeItem("pending_invite_token");
    router.replace(`/invite/${pendingToken}`);
  } else {
    router.replace("/home");
  }
}

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: "height" })}
        style={styles.flex}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Retseptify</Text>

          <TextInput
            placeholder="username või e-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <TextInput
            placeholder="password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            onPress={onLogin}
            style={styles.btnPrimary}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.btnPrimaryText}>Log in</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setShowRegister(true)}
            style={styles.btnSecondary}
          >
            <Text style={styles.btnSecondaryText}>Register</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <RegisterModal
        visible={showRegister}
        onClose={() => setShowRegister(false)}
        router={router}
      />
    </>
  );
}
