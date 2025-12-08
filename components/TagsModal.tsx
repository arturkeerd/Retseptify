import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Mode = "view" | "edit"; // tulevikuks valmis, praegu kasutame "view"

type Props = {
  visible: boolean;
  mode: Mode;
  tags: string[];
  onClose: () => void;

  // kui hiljem tahad editida, saame seda prop’i kasutusele võtta
  onChangeTags?: (tags: string[]) => void;
};

export default function TagsModal({
  visible,
  mode,
  tags,
  onClose,
}: Props) {
  const uniqueTags = Array.from(new Set(tags));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* overlay – klikk sulgeb */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={s.overlay}
      >
        {/* sisu – klikk ei sulge */}
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={s.card}>
          <Text style={s.title}>
            {mode === "edit" ? "Märksõnade redigeerimine" : "Märksõnad"}
          </Text>

          <View style={s.tagsWrap}>
            {uniqueTags.length === 0 ? (
              <Text style={s.emptyText}>Märksõnu pole lisatud.</Text>
            ) : (
              uniqueTags.map((tag) => (
                <View key={tag} style={s.tagChip}>
                  <Text style={s.tagText}>{tag}</Text>
                </View>
              ))
            )}
          </View>

          <View style={s.footerRow}>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeText}>Sulge</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(169, 149, 108, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  tagText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
  },
  footerRow: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  closeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  closeText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
