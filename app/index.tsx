import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
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
    setError(null);

    if (!email.trim()) return setError("Palun sisesta e-mail.");
    if (!password) return setError("Palun sisesta parool.");

    setBusy(true);
    const res = await loginWithEmail(email.trim(), password);
    setBusy(false);

    if (!res.ok) return setError(res.error);
    router.replace("/home");
  }

return (
  <ImageBackground
    source={require("../assets/images/background.png")}
    style={styles.bg}
    resizeMode="cover"
  >
    {/* 🔒 lukustab ekraani kõrguse */}
    <View style={styles.screenLock}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <View style={styles.container}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <TextInput
              placeholder="e-mail"
              placeholderTextColor="#6B6B6B"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />

            <TextInput
              placeholder="password"
              placeholderTextColor="#6B6B6B"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              onPress={onLogin}
              style={({ pressed }) => [
                styles.btn,
                pressed && styles.btnPressed,
              ]}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.btnText}>Log in</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => setShowRegister(true)}
              style={({ pressed }) => [
                styles.btn,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.btnText}>Register</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <RegisterModal
        visible={showRegister}
        onClose={() => setShowRegister(false)}
      />
    </View>
  </ImageBackground>
);
}
