// components/DescriptionCard.tsx
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
};

export default function DescriptionCard({ value, onChangeText }: Props) {
  return (
    <View style={s.card}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={s.input}
        multiline
        textAlignVertical="top"
        placeholder="Retsepti kirjeldus"
        placeholderTextColor="#9A9184"
      />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    minHeight: 140,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  input: {
    flex: 1,
    minHeight: 140,
    fontSize: 14,
    color: "#222",
  },
});
