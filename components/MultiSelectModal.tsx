import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Item = { id: string; label: string; color?: string | null };

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;

  items: Item[];
  selectedIds: string[];

  onToggle: (id: string) => void;
  onClose: () => void;

  primaryLabel?: string;   // nt "Valmis"
  secondaryLabel?: string; // nt "Loobu"
  hintText?: string;       // nt "Vali vähemalt 1 köök"
};

export default function MultiSelectModal({
  visible,
  title,
  subtitle,
  items,
  selectedIds,
  onToggle,
  onClose,
  primaryLabel = "Valmis",
  secondaryLabel = "Loobu",
  hintText,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={s.card}>
          <Text style={s.title}>{title}</Text>
          {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}

          {items.map((it) => {
            const on = selectedIds.includes(it.id);
            return (
              <TouchableOpacity
                key={it.id}
                style={s.row}
                activeOpacity={0.85}
                onPress={() => onToggle(it.id)}
              >
                <View style={[s.check, on && s.checkOn]} />
                <View style={s.labelRow}>
                  <Text style={s.label}>{it.label}</Text>
                  {!!it.color && <View style={[s.colorDot, { backgroundColor: it.color }]} />}
                </View>
              </TouchableOpacity>
            );
          })}

          {!!hintText && <Text style={s.hint}>{hintText}</Text>}

          <View style={s.actions}>
            <TouchableOpacity style={s.btn} onPress={onClose}>
              <Text style={s.btnText}>{secondaryLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.btn, s.btnPrimary]} onPress={onClose}>
              <Text style={[s.btnText, s.btnPrimaryText]}>{primaryLabel}</Text>
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
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: "800", color: "#222", marginBottom: 6 },
  subtitle: { fontSize: 12, color: "#555", marginBottom: 10 },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  check: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#C8B89B",
    marginRight: 10,
  },
  checkOn: { backgroundColor: "#B59C77" },

  labelRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  label: { fontSize: 14, color: "#222" },
  colorDot: { width: 14, height: 14, borderRadius: 7 },

  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#F2F2F2",
  },
  btnPrimary: { backgroundColor: "#B59C77" },
  btnText: { fontWeight: "800", color: "#222" },
  btnPrimaryText: { color: "#fff" },

  hint: { marginTop: 8, fontSize: 12, color: "#b00020", fontWeight: "600" },
});
