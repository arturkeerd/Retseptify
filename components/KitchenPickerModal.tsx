// components/KitchenPickerModal.tsx
import type { Kitchen } from "@/components/KitchensModal";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  kitchens: Kitchen[];
  selectedKitchenId: string | null;
  onSelect: (kitchenId: string) => void;
  onClose: () => void;
};

export default function KitchenPickerModal({
  visible,
  kitchens,
  selectedKitchenId,
  onSelect,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.card} activeOpacity={1} onPress={() => {}}>
          <Text style={s.title}>Vali köök</Text>

          <View>
            {kitchens.length === 0 ? (
              <Text style={s.empty}>Kööke ei leitud.</Text>
            ) : (
              kitchens.map((k, idx) => {
                const active = k.id === selectedKitchenId;
                return (
                  <View key={k.id}>
                    <TouchableOpacity
                      style={[s.row, active && s.rowActive]}
                      onPress={() => {
                        onSelect(k.id);
                        onClose();
                      }}
                    >
                      <View style={s.rowLeft}>
                        <View style={[s.dot, { backgroundColor: k.color ?? "#E8E8E8" }]} />
                        <Text style={[s.rowText, active && s.rowTextActive]}>{k.name}</Text>
                      </View>
                      <View style={[s.check, active && s.checkOn]} />
                    </TouchableOpacity>
                    {idx < kitchens.length - 1 && <View style={s.divider} />}
                  </View>
                );
              })
            )}
          </View>

          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeText}>Sulge</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 18,
  },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16 },
  title: { fontSize: 18, fontWeight: "800", color: "#222", marginBottom: 10 },
  empty: { fontSize: 14, color: "#666" },

  row: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowActive: { backgroundColor: "#F2E9D9" },

  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: "#DDD" },
  rowText: { fontSize: 14, fontWeight: "800", color: "#222" },
  rowTextActive: { color: "#6B4F2E" },

  check: { width: 18, height: 18, borderRadius: 5, borderWidth: 2, borderColor: "#C8B89B" },
  checkOn: { backgroundColor: "#B59C77" },

  divider: { height: 1, backgroundColor: "#EDEDED" },
  closeBtn: { marginTop: 12, alignSelf: "flex-end", paddingVertical: 8, paddingHorizontal: 10 },
  closeText: { fontSize: 14, fontWeight: "800", color: "#222" },
});
