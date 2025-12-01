import AddKitchenButton from "@/components/AddKitchenButton";
import CreateKitchenModal from "@/components/CreateKitchenModal";
import HomeButton from "@/components/HomeButton";
import ProfileButton from "@/components/ProfileButton";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
    // TODO: Open color picker modal
    console.log("Edit color for:", kitchen.name);
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
    </View>
  );
}