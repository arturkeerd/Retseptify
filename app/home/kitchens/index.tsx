import AddKitchenButton from "@/components/AddKitchenButton";
import ColorPickerModal from "@/components/ColorPickerModal";
import { APP_COLORS } from "@/components/colors";
import CreateKitchenModal from "@/components/CreateKitchenModal";
import HomeButton from "@/components/HomeButton";
import ProfileButton from "@/components/ProfileButton";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./styles";

type Kitchen = {
  id: string;
  name: string;
  type: string;
  color: string;
};

export default function Kitchens() {
  const router = useRouter();
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  
  // Color picker state
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [editingKitchen, setEditingKitchen] = useState<Kitchen | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadKitchens();
  }, []);

  const loadKitchens = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No user found");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("kitchen_members")
      .select("kitchens(id, name, type, color)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading kitchens:", error);
    } else if (data) {
      const kitchenList = data
        .map((item: any) => item.kitchens)
        .filter((k: any) => k !== null);
      setKitchens(kitchenList);
    }

    setLoading(false);
  };

  const getKitchenIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("isiklik") || lowerName.includes("minu")) return "✓";
    if (lowerName.includes("paral")) return "✗";
    if (lowerName.includes("kampus")) return "⚙";
    if (lowerName.includes("pompei")) return "✎";
    if (lowerName.includes("humal")) return "●";
    return "◆";
  };

  const handleColorEdit = (kitchen: Kitchen) => {
    setEditingKitchen(kitchen);
    setColorModalVisible(true);
  };

  const handleColorSelect = async (color: string) => {
    if (!editingKitchen) return;

    setSaving(true);

    const { error } = await supabase
      .from("kitchens")
      .update({ color: color })
      .eq("id", editingKitchen.id);

    if (error) {
      console.error("Error updating kitchen color:", error);
      Alert.alert("Viga", "Värvi uuendamine ebaõnnestus");
    } else {
      // Update local state
      setKitchens((prev) =>
        prev.map((k) =>
          k.id === editingKitchen.id ? { ...k, color: color } : k
        )
      );
      setColorModalVisible(false);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B7355" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.kitchensList}>
          {kitchens.map((kitchen) => (
            <View key={kitchen.id} style={styles.kitchenRow}>
              <TouchableOpacity
                style={[
                  styles.kitchenButton,
                  { backgroundColor: kitchen.color || "#FFFFFF" },
                ]}
                onPress={() => {
                  router.push(`/home?kitchen=${kitchen.id}`);
                }}
              >
                <Text style={styles.kitchenIcon}>
                  {getKitchenIcon(kitchen.name)}
                </Text>
                <Text style={styles.kitchenName}>{kitchen.name}</Text>

                {/* Edit button INSIDE kitchen button */}
                <TouchableOpacity
                  style={[
                    styles.colorEditButton,
                    { backgroundColor: kitchen.color || "#FFFFFF" },
                  ]}
                  onPress={() => handleColorEdit(kitchen)}
                >
                  <Text style={styles.colorEditIcon}>✎</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        {/* Vasak pool - Add button */}
        <View style={styles.leftSide}>
          <AddKitchenButton onPress={() => setCreateModalVisible(true)} />
        </View>

        {/* Keskel - HomeButton */}
        <View style={styles.centerSide}>
          <HomeButton />
        </View>

        {/* Parem pool - ProfileButton */}
        <View style={styles.rightSide}>
          <ProfileButton />
        </View>
      </View>

      <CreateKitchenModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onKitchenCreated={loadKitchens}
      />

      <ColorPickerModal
        visible={colorModalVisible}
        onClose={() => setColorModalVisible(false)}
        onSelectColor={handleColorSelect}
        currentColor={editingKitchen?.color || "#FFFFFF"}
        colors={APP_COLORS}
        title={editingKitchen?.name || ""}
        subtitle="Vali värv"
        showLoading={saving}
      />
    </View>
  );
}