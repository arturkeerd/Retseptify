import React from "react";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export type IngredientRow = {
  key: string;
  name: string;
  quantity: string;
  unit: string | null;
};

type Props = {
  rows: IngredientRow[];
  onChangeRow: (key: string, patch: Partial<IngredientRow>) => void;
  onPressUnit: (key: string) => void;
  onAddRow: () => void;
  addIcon: any; // require(...)
};

export default function IngredientsTable({
  rows,
  onChangeRow,
  onPressUnit,
  onAddRow,
  addIcon,
}: Props) {
  return (
    <View style={s.wrap}>
      <View style={s.headerRow}>
        <Text style={[s.headerText, s.colName]}>Tooraine</Text>
        <Text style={[s.headerText, s.colQty]}>Kogus</Text>
        <Text style={[s.headerText, s.colUnit]}>Ühik</Text>
      </View>

      <View style={s.tableRows}>
        {rows.map((row) => (
          <View key={row.key} style={s.row}>
            <TextInput
              value={row.name}
              onChangeText={(t) => onChangeRow(row.key, { name: t })}
              style={[s.cellInput, s.colName]}
              placeholder=""
              placeholderTextColor="#999"
            />

            <TextInput
              value={row.quantity}
              onChangeText={(t) =>
                onChangeRow(row.key, { quantity: t.replace(",", ".") })
              }
              keyboardType="numeric"
              style={[s.cellInput, s.colQty]}
              placeholder=""
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={[s.unitCell, s.colUnit]}
              activeOpacity={0.85}
              onPress={() => onPressUnit(row.key)}
            >
              <Text style={s.unitText}>{row.unit ?? "-"}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={s.addRowWrap}>
        <TouchableOpacity
          style={s.addRowBtn}
          activeOpacity={0.9}
          onPress={onAddRow}
        >
          <Image source={addIcon} style={s.addIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 14 },

  headerRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  headerText: { fontSize: 12, fontWeight: "700", color: "#222" },

  // “columns” widths
  colName: { flex: 1.1 },
  colQty: { width:55 },
  colUnit: { width: 55 },

  tableRows: { gap: 8 },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  cellInput: {
    height: 28,
    backgroundColor: "#fff",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#E2D3B8",
    paddingHorizontal: 8,
    paddingVertical: 0,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  unitCell: {
    height: 28,
    backgroundColor: "#fff",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#E2D3B8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  unitText: { fontSize: 12, fontWeight: "700", color: "#222" },

  addRowWrap: { marginTop: 10, alignItems: "flex-start" },
  addRowBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#B59C77",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#6B4F2E",
  },
  addIcon: { width: 16, height: 16 },
});
