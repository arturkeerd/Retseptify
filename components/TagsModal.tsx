// components/TagsModal.tsx
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Mode = "view" | "edit";

type Props = {
  visible: boolean;
  mode: Mode;
  tags: string[];           // detailview: retsepti märksõnad
  allTags?: string[];       // addrecipe: kõik võimalikud
  selectedTags?: string[];  // addrecipe: valitud
  onToggleTag?: (tag: string) => void;
  onAddTag?: (name: string) => void;
  onDeleteTag?: (tag: string) => void; // edit režiimis punane X
  onClose: () => void;
};

export default function TagsModal({
  visible,
  mode,
  tags,
  allTags = [],
  selectedTags = [],
  onToggleTag,
  onAddTag,
  onDeleteTag,
  onClose,
}: Props) {
  const [newTag, setNewTag] = useState("");

  const isEdit = mode === "edit";
  const listToShow = isEdit ? allTags : tags;

  const handleAdd = () => {
    const trimmed = newTag.trim();
    if (!trimmed || !onAddTag) return;
    onAddTag(trimmed);
    setNewTag("");
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Märksõnad</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Sulge</Text>
            </TouchableOpacity>
          </View>

          {/* Edit režiimi juhised + sisestus */}
          {isEdit && (
            <View style={styles.editTopRow}>
              <TextInput
                style={styles.inputPill}
                placeholder="kirjuta ja vajuta enter"
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={handleAdd}
              />
              <View style={styles.editHelperTextWrap}>
                <Text style={styles.editHelperText}>
                  kirjuta ja vajuta enter
                </Text>
                <Text style={styles.editHelperText}>
                  punane rist kustutab märksõna
                </Text>
              </View>
            </View>
          )}

          {/* Märksõnade pilved */}
          <ScrollView
            style={styles.tagsScroll}
            contentContainerStyle={styles.tagsWrap}
            keyboardShouldPersistTaps="handled"
          >
            {listToShow.length === 0 ? (
              <Text style={styles.emptyText}>Märksõnu ei ole.</Text>
            ) : (
              listToShow.map((tag) => {
                const active =
                  isEdit && selectedTags?.includes(tag);

                return (
                  <View key={tag} style={styles.tagWrapper}>
                    <TouchableOpacity
                      activeOpacity={isEdit && onToggleTag ? 0.8 : 1}
                      onPress={() => onToggleTag?.(tag)}
                      style={[
                        styles.tagPill,
                        active && styles.tagPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          active && styles.tagTextActive,
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>

                    {isEdit && onDeleteTag && (
                      <TouchableOpacity
                        style={styles.deleteHitbox}
                        onPress={() => onDeleteTag(tag)}
                      >
                        <Text style={styles.deleteText}>x</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const PILL_BG = "#B48C5A"; // pruun pill
const CARD_BG = "#FFFFFF";

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 24,
    backgroundColor: CARD_BG,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeText: {
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },

  // edit režiimi sisestus
  editTopRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  inputPill: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 14,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  editHelperTextWrap: {
    flexShrink: 1,
  },
  editHelperText: {
    fontSize: 11,
    color: "#555",
  },

  // tags
  tagsScroll: {
    maxHeight: 260,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#777",
  },
  tagWrapper: {
    position: "relative",
  },
  tagPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: PILL_BG,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tagPillActive: {
    borderWidth: 2,
    borderColor: "#3F2E20",
  },
  tagText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  tagTextActive: {
    fontWeight: "700",
  },
  deleteHitbox: {
    position: "absolute",
    top: -6,
    right: -6,
  },
  deleteText: {
    color: "#FF0000",
    fontWeight: "700",
    fontSize: 14,
  },
});
