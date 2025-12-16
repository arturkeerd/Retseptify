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
    setBusy(true);
    setError(null);
    const res = await loginWithEmail(email.trim(), password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.replace("/home");
  }

  return (
    <>
      <ImageBackground
        source={require("../assets/images/background.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: "height" })}
          style={styles.flex}
        >
          <View style={styles.container}>
            <View style={styles.logoWrap}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.form}>
              <TextInput
                placeholder="e-mail"
                placeholderTextColor={styles.placeholder.color}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />

              <TextInput
                placeholder="parool"
                placeholderTextColor={styles.placeholder.color}
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
                  styles.btnPrimary,
                  pressed && styles.btnPressed,
                  busy && styles.btnDisabled,
                ]}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.btnText}>Logi sisse</Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => setShowRegister(true)}
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnSecondary,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text style={styles.btnText}>Registreeri</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>

      <RegisterModal
        visible={showRegister}
        onClose={() => setShowRegister(false)}
      />
    </>
  );
}
