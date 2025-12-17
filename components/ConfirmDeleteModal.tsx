import React from "react";
import {
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteModal({
  visible,
  title = "Oled kindel?",
  message = "Seda tegevust ei saa tagasi võtta.",
  onCancel,
  onConfirm,
}: Props) {
  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      {/* overlay */}
      <Pressable
        style={{ position: "absolute", inset: 0 }}
        onPress={onCancel}
      />

      {/* CARD */}
      <View
        style={{
          width: 280,
          backgroundColor: "#fff",
          borderRadius: 18,
          paddingVertical: 20,
          paddingHorizontal: 18,
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        }}
      >
        {/* TITLE */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "900",
            color: "#111",
            textAlign: "center",
            marginBottom: message ? 10 : 20,
          }}
        >
          {title}
        </Text>

        {/* MESSAGE */}
        {message && (
          <Text
            style={{
              fontSize: 13,
              color: "#444",
              textAlign: "center",
              marginBottom: 20,
              lineHeight: 18,
            }}
          >
            {message}
          </Text>
        )}

        {/* BUTTONS */}
        <View style={{ flexDirection: "row", gap: 26 }}>
          {/* CANCEL */}
          <TouchableOpacity
            onPress={onCancel}
            activeOpacity={0.85}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "#FF5C5C",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <Text
              style={{
                fontSize: 26,
                fontWeight: "900",
                color: "#fff",
                lineHeight: 26,
              }}
            >
              ✕
            </Text>
          </TouchableOpacity>

          {/* CONFIRM */}
          <TouchableOpacity
            onPress={onConfirm}
            activeOpacity={0.85}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "#3DDE5A",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <Text
              style={{
                fontSize: 26,
                fontWeight: "900",
                color: "#0B3D16",
                lineHeight: 26,
              }}
            >
              ✓
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
