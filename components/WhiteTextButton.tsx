import React, { ReactNode } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
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
  btn: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  btnPrimary: {},
  btnSecondary: {
    shadowOpacity: 0.06,
    elevation: 2,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
  row: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontWeight: "600", fontSize: 16, color: "#000" },
  textSecondary: { fontWeight: "500", color: "#333" },
});