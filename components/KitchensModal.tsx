// components/KitchensModal.tsx
import React from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Mode = "view" | "edit";

export type Kitchen = {
  id: string;
  name: string;
  color?: string | null;
};

type Props = {
  visible: boolean;
  mode: Mode;

  // detailview – lihtsalt kuvamine:
  kitchens: Kitchen[];

  // addrecipe – edit:
  allKitchens?: Kitchen[];
  selectedKitchenIds?: string[];
  onToggleKitchen?: (id: string) => void;

  onClose: () => void;
};

export default function KitchensModal({
  visible,
  mode,
  kitchens,
  allKitchens = [],
  selectedKitchenIds = [],
  onToggleKitchen,
  onClose,
}: Props) {
  const isEdit = mode === "edit";
  const list = isEdit ? allKitchens : kitchens;

  const isSelected = (id: string) =>
    selectedKitchenIds?.includes(id);

  const handlePressRow = (id: string) => {
    if (!isEdit || !onToggleKitchen) return;
    onToggleKitchen(id);
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
          <View style={styles.headerRow}>
            <Text style={styles.title}>Köök</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Sulge</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list}>
            {list.length === 0 ? (
              <Text style={styles.emptyText}>Kööke ei ole.</Text>
            ) : (
              list.map((k) => {
                const dotColor = k.color || "#E5E5E5";
                const active = isEdit && isSelected(k.id);

                return (
                  <TouchableOpacity
                    key={k.id}
                    activeOpacity={isEdit ? 0.8 : 1}
                    onPress={() => handlePressRow(k.id)}
                    style={[
                      styles.row,
                      active && styles.rowActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.kitchenName,
                        active && styles.kitchenNameActive,
                      ]}
                    >
                      {k.name}
                    </Text>

                    <View style={styles.rightSide}>
                      {/* värvi-täpp */}
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: dotColor },
                        ]}
                      />

                      {/* edit režiimis – ruuduke */}
                      {isEdit && (
                        <View
                          style={[
                            styles.checkbox,
                            active && styles.checkboxActive,
                          ]}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {isEdit && (
            <Text style={styles.helperText}>
              Vähemalt üks köök peab olema valitud.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 220,
    maxHeight: "70%",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  list: {
    maxHeight: 220,
  },
  emptyText: {
    fontSize: 14,
    color: "#777",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowActive: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  kitchenName: {
    fontSize: 14,
    fontWeight: "600",
  },
  kitchenNameActive: {
    textDecorationLine: "underline",
  },
  rightSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#999",
    backgroundColor: "#FFF",
  },
  checkboxActive: {
    backgroundColor: "#4F6B60",
    borderColor: "#4F6B60",
  },
  helperText: {
    marginTop: 8,
    fontSize: 11,
    color: "#555",
  },
});
