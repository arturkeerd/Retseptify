import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerWithEmail } from "@/hooks/useAuth";
import WhiteTextField from "./WhiteTextField";
import WhiteTextButton from "./WhiteTextButton";

const schema = z
  .object({
    displayName: z.string().min(2, "Liiga lühike"),
    email: z.string().email("Vigane e-mail"),
    password: z.string().min(6, "Vähemalt 6 märki"),
    password2: z.string().min(6, "Vähemalt 6 märki"),
  })
  .refine((v) => v.password === v.password2, {
    message: "Paroolid ei ühti",
    path: ["password2"],
  });

type FormValues = z.infer<typeof schema>;

type Props = {
  visible: boolean;
  onClose: () => void;
  onRegistered?: () => void;
};

export default function RegisterModal({
  visible,
  onClose,
  onRegistered,
}: Props) {
  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = handleSubmit(async ({ displayName, email, password }) => {
    setErr(null);
    setSubmitting(true);
    const res = await registerWithEmail(
      email.trim(),
      password,
      displayName.trim()
    );
    setSubmitting(false);
    if (!res.ok) return setErr(res.error);
    onRegistered?.();
    onClose();
  });

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={s.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: "height" })}
        >
          <View style={s.modal}>
            <Text style={s.title}>Registreerimine</Text>

            <WhiteTextField
              placeholder="Kuvatav nimi"
              onChangeText={(t) =>
                setValue("displayName", t, { shouldValidate: true })
              }
              errorText={errors.displayName?.message}
            />

            <WhiteTextField
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(t) =>
                setValue("email", t, { shouldValidate: true })
              }
              errorText={errors.email?.message}
            />

            <WhiteTextField
              placeholder="Parool"
              secureTextEntry
              onChangeText={(t) =>
                setValue("password", t, { shouldValidate: true })
              }
              errorText={errors.password?.message}
            />

            <WhiteTextField
              placeholder="Parool uuesti"
              secureTextEntry
              onChangeText={(t) =>
                setValue("password2", t, { shouldValidate: true })
              }
              errorText={errors.password2?.message}
            />

            {!!err && <Text style={s.errCenter}>{err}</Text>}

            <View style={s.row}>
              <WhiteTextButton
                label="Tühista"
                onPress={onClose}
                variant="secondary"
              />
              <WhiteTextButton
                label={submitting ? "" : "Registreeri"}
                onPress={onSubmit}
                rightNode={submitting ? <ActivityIndicator /> : undefined}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

import { StyleSheet } from "react-native";
const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modal: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 12, marginTop: 14 },
  errCenter: { color: "#c62828", textAlign: "center", marginTop: 6 },
});
