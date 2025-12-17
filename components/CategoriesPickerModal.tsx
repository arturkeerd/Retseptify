import { supabase } from "@/lib/supabase";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

type Tag = { id: string; name: string };

export default function TagsPickerModal(props: {
  visible: boolean;
  recipeId: string | null; // edit mode only
  selectedTagIds: string[];
  onChangeSelected: (next: string[]) => void;
  onClose: () => void;
}) {
  const { visible, recipeId, selectedTagIds, onChangeSelected, onClose } = props;
  const [tags, setTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      const { data, error } = await supabase.from("tags").select("id, name").order("name");
      if (error) {
        console.log("load tags error", error.message);
        setTags([]);
        return;
      }
      setTags((data as Tag[]) ?? []);
    })();
  }, [visible]);

  const toggle = (id: string) => {
    const has = selectedTagIds.includes(id);
    onChangeSelected(has ? selectedTagIds.filter((x) => x !== id) : [...selectedTagIds, id]);
  };

  const selectedNames = useMemo(() => {
    const map = new Map(tags.map((t) => [t.id, t.name]));
    return selectedTagIds.map((id) => map.get(id)).filter(Boolean) as string[];
  }, [selectedTagIds, tags]);

  const save = async () => {
    // Kui pole recipeId (uue retsepti draft), ära crashi — lihtsalt hoia local state
    if (!recipeId) {
      onClose();
      return;
    }

    setSaving(true);

    await supabase.from("recipe_tags").delete().eq("recipe_id", recipeId);

    if (selectedTagIds.length > 0) {
      const payload = selectedTagIds.map((tag_id) => ({ recipe_id: recipeId, tag_id }));
      const { error } = await supabase.from("recipe_tags").insert(payload);
      if (error) console.log("save recipe_tags error", error.message);
    }

    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 18 }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 14,
            maxHeight: "75%",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#222" }}>Märksõnad</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 14, fontWeight: "800" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 8 }} />

          {selectedNames.length > 0 && (
            <Text style={{ fontSize: 12, color: "#444", marginBottom: 10 }}>
              Valitud: {selectedNames.join(", ")}
            </Text>
          )}

          <ScrollView>
            <View style={{ gap: 10 }}>
              {tags.map((t) => {
                const active = selectedTagIds.includes(t.id);
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => toggle(t.id)}
                    activeOpacity={0.85}
                    style={{
                      borderWidth: 2,
                      borderColor: active ? "#222" : "#E2D3B8",
                      borderRadius: 14,
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      backgroundColor: active ? "rgba(0,0,0,0.04)" : "#fff",
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "800", color: "#222" }}>{t.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={{ height: 12 }} />

          <TouchableOpacity
            onPress={save}
            disabled={saving}
            activeOpacity={0.85}
            style={{
              borderRadius: 16,
              paddingVertical: 12,
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#E2D3B8",
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "900", color: "#222" }}>
              {saving ? "Salvestan…" : "Salvesta"}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
