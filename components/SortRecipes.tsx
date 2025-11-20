// components/SortRecipes.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";

export type SortMode =
  | "NEWEST"
  | "OLDEST"
  | "TITLE_AZ"
  | "TITLE_ZA"
  | "KITCHEN_AZ"
  | "KITCHEN_ZA";

type Props = {
  visible: boolean;
  onClose: () => void;
  sortMode: SortMode;
  onChangeSortMode: (mode: SortMode) => void;
};

export function SortRecipes({
  visible,
  onClose,
  sortMode,
  onChangeSortMode,
}: Props) {
  const options: { mode: SortMode; label: string }[] = [
    { mode: "TITLE_AZ", label: "Retsept A–Z" },
    { mode: "TITLE_ZA", label: "Retsept Z–A" },
    { mode: "KITCHEN_AZ", label: "Köök A–Z" },
    { mode: "KITCHEN_ZA", label: "Köök Z–A" },
    { mode: "NEWEST", label: "Uuemad ees" },
    { mode: "OLDEST", label: "Vanemad ees" },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* hall taust – klik väljas sulgeb */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* kaart */}
        <View style={styles.card}>
          <Text style={styles.title}>Sorteeri</Text>

          <View style={styles.chipsColumn}>
            {options.map((opt) => {
              const active = sortMode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  onPress={() => {
                    onChangeSortMode(opt.mode);
                    onClose();
                  }}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "#F9F9F2",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  chipsColumn: {
    gap: 12,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignSelf: "flex-start",
    backgroundColor: "#F4F4E4",
  },
  chipActive: {
    backgroundColor: "#E4E0B0",
  },
  chipText: {
    fontSize: 16,
  },
  chipTextActive: {
    fontWeight: "700",
  },
});
