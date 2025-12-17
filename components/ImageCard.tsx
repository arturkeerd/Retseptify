import React from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  imageUrl: string | null;
  photoIcon: any; // require(...) image
  onPress: () => void;
};

export default function ImageCard({ imageUrl, photoIcon, onPress }: Props) {
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.9} onPress={onPress}>
      <View style={s.imagePickButton}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={s.imagePreview} />
        ) : (
          <View style={s.imagePickInner}>
            <Image source={photoIcon} style={s.photoIcon} />
          </View>
        )}
      </View>

      <Text style={s.hint}>(Siia saab importida pilte, ei ole kaamera funktsioon)</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    alignItems: "center",
  },
  imagePickButton: {
    width: 160,
    height: 100,
    borderRadius: 10,
    backgroundColor: "#EDE2CC",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imagePickInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#B59C77",
    alignItems: "center",
    justifyContent: "center",
  },
  photoIcon: { width: 28, height: 28 },
  imagePreview: { width: "100%", height: "100%" },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: "#222",
    textAlign: "center",
  },
});
