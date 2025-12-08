import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type Kitchen = {
  id: string;
  name: string;
  color: string | null;
};

type Mode = "view" | "edit";

type Props = {
  visible: boolean;
  mode: Mode;
  kitchens: Kitchen[];
  onClose: () => void;

  // tulevikuks: kui tahad valikut muuta
  onToggleKitchen?: (id: string) => void;
};

export default function KitchensModal({
  visible,
  mode,
  kitchens,
  onClose,
}: Props) {
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
        {/* sisu – peatab klikid */}
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={s.card}>
          <Text style={s.title}>
            {mode === "edit" ? "Köögivalik" : "Köögid"}
          </Text>

          <View style={s.list}>
            {kitchens.length === 0 ? (
              <Text style={s.emptyText}>Ühtegi kööki pole seotud.</Text>
            ) : (
              kitchens.map((k, idx) => (
                <View key={k.id}>
                  <View style={s.row}>
                    <Text style={s.kitchenName}>{k.name}</Text>
                    <View
                      style={[
                        s.colorDot,
                        { backgroundColor: k.color || "#E8E8E8" },
                      ]}
                    />
                  </View>
                  {/* eraldusjoon ridade vahel */}
                  {idx < kitchens.length - 1 && (
                    <View style={s.divider} />
                  )}
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
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  list: {},
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  kitchenName: {
    fontSize: 15,
    fontWeight: "500",
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
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
