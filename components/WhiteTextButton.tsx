import React, { ReactNode } from "react";
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";

type Props = {
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: "primary" | "secondary";
  leftNode?: ReactNode;
  rightNode?: ReactNode;
  disabled?: boolean;
};

export default function WhiteTextButton({
  label,
  onPress,
  variant = "primary",
  leftNode,
  rightNode,
  disabled,
}: Props) {
  const isSecondary = variant === "secondary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        isSecondary ? s.btnSecondary : s.btnPrimary,
        pressed && s.pressed,
        disabled && s.disabled,
      ]}
    >
      <View style={s.row}>
        {leftNode}
        <Text style={[s.text, isSecondary && s.textSecondary]}>{label}</Text>
        {rightNode}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  btnPrimary: { backgroundColor: "#EAEAEA" },
  btnSecondary: { backgroundColor: "#EEE" },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  row: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontWeight: "700", color: "#000" },
  textSecondary: { fontWeight: "600", color: "#333" },
});
