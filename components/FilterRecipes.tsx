import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;

  allKitchens: string[];
  allTags: string[];
  selectedKitchens: string[];
  selectedTags: string[];
  onClearAll: () => void;          // ainult TAGIDE nullimiseks
  onToggleKitchen: (name: string) => void;
  onToggleTag: (tag: string) => void;
  onSelectAllTags: () => void;
};

export function FilterRecipes({
  visible,
  onClose,
  allKitchens,
  allTags,
  selectedKitchens,
  selectedTags,
  onClearAll,
  onToggleKitchen,
  onToggleTag,
  onSelectAllTags,
}: Props) {
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

        {/* valge kaart */}
        <View style={styles.card}>
          <Text style={styles.title}>Filtreeri</Text>

          {/* Köögid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Köögid</Text>
            </View>

            {/* Köökide chipid – alguses kõik aktiivsed, vajutades lülitab välja */}
            <View style={styles.kitchenRow}>
              {allKitchens.map((name) => {
                const active = selectedKitchens.includes(name);
                return (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.kitchenChip,
                      active && styles.kitchenChipActive,
                    ]}
                    onPress={() => onToggleKitchen(name)}
                  >
                    <Text style={styles.kitchenChipText}>{name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Märksõnad */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Märksõnad</Text>
            </View>

            <View style={styles.rowCenter}>
              <TouchableOpacity
                style={[
                  styles.bigPill,
                  selectedTags.length === allTags.length &&
                    allTags.length > 0 &&
                    styles.bigPillActive,
                ]}
                onPress={onSelectAllTags}
              >
                <Text style={styles.bigPillText}>Kõik</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bigPill,
                  selectedTags.length === 0 && styles.bigPillActive,
                ]}
                onPress={onClearAll}
              >
                <Text style={styles.bigPillText}>Nulli</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tagsWrap}>
              {allTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagChip, active && styles.tagChipActive]}
                    onPress={() => onToggleTag(tag)}
                  >
                    <Text style={styles.tagChipText}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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
    width: "90%",
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  kitchenRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kitchenChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E1E1E1",
  },
  kitchenChipActive: {
    backgroundColor: "#C7D2BF",
  },
  kitchenChipText: {
    fontSize: 15,
  },
  rowCenter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  bigPill: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#F5F5DA",
  },
  bigPillActive: {
    backgroundColor: "#E4E0B0",
  },
  bigPillText: {
    fontSize: 16,
    fontWeight: "600",
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tagChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#C89A6A",
  },
  tagChipActive: {
    backgroundColor: "#A67848",
  },
  tagChipText: {
    fontSize: 15,
    color: "#000",
  },
});
