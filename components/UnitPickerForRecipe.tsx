import React, { useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type UnitCategory = "mass" | "volume" | "piece";

const CATEGORY_LABEL: Record<UnitCategory, string> = {
  mass: "Kaal",
  volume: "Maht",
  piece: "Tükk",
};

const UNITS_BY_CATEGORY: Record<UnitCategory, string[]> = {
  mass: ["g", "kg", "mg"],
  volume: ["ml", "l", "tsp", "tbsp", "cup"],
  piece: ["pc", "slice", "clove"],
};

export default function TwoStepUnitPickerForRecipe(props: {
  visible: boolean;
  initialUnit: string | null;
  onSelect: (unit: string) => void;
  onClose: () => void;
}) {
  const { visible, initialUnit, onSelect, onClose } = props;

  const initialCategory = useMemo<UnitCategory | null>(() => {
    if (!initialUnit) return null;
    const found = (Object.keys(UNITS_BY_CATEGORY) as UnitCategory[]).find((c) =>
      UNITS_BY_CATEGORY[c].includes(initialUnit)
    );
    return found ?? null;
  }, [initialUnit]);

  const [step, setStep] = useState<1 | 2>(initialCategory ? 2 : 1);
  const [category, setCategory] = useState<UnitCategory | null>(initialCategory);

  const close = () => {
    setStep(initialCategory ? 2 : 1);
    setCategory(initialCategory);
    onClose();
  };

  const pickCategory = (c: UnitCategory) => {
    setCategory(c);
    setStep(2);
  };

  const units = category ? UNITS_BY_CATEGORY[category] : [];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 18 }}
        onPress={close}
      >
        <Pressable
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 14,
            maxHeight: "70%",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#222" }}>
              {step === 1 ? "Vali ühiku tüüp" : "Vali ühik"}
            </Text>

            <TouchableOpacity onPress={close}>
              <Text style={{ fontSize: 14, fontWeight: "800" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 10 }} />

          {step === 1 ? (
            <View style={{ gap: 10 }}>
              {(Object.keys(CATEGORY_LABEL) as UnitCategory[]).map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => pickCategory(c)}
                  activeOpacity={0.85}
                  style={{
                    borderWidth: 1,
                    borderColor: "#E2D3B8",
                    borderRadius: 14,
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "800", color: "#222" }}>
                    {CATEGORY_LABEL[c]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setStep(1)}
                activeOpacity={0.85}
                style={{ paddingVertical: 10 }}
              >
                <Text style={{ fontSize: 12, fontWeight: "800", color: "#444" }}>
                  ← tagasi (kategooriad)
                </Text>
              </TouchableOpacity>

              <ScrollView>
                <View style={{ gap: 10 }}>
                  {units.map((u) => (
                    <TouchableOpacity
                      key={u}
                      onPress={() => onSelect(u)}
                      activeOpacity={0.85}
                      style={{
                        borderWidth: 1,
                        borderColor: "#E2D3B8",
                        borderRadius: 14,
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "800", color: "#222" }}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
