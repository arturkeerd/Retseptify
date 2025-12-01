import HomeButton from "@/components/HomeButton";
import KitchenColorPicker from "@/components/KitchenColorPicker";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
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

type UserProfile = {
  username: string;
  profile_image_url: string | null;
};

export default function Kitchens() {
  const router = useRouter();
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [selectedKitchen, setSelectedKitchen] = useState<Kitchen | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No user found");
      setLoading(false);
      return;
    }

    // Load user profile
    const { data: userData } = await supabase
      .from("users")
      .select("username, profile_image_url")
      .eq("id", user.id)
      .single();

    if (userData) {
      setProfile(userData);
    }

    // Get kitchens where user is owner or member
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
    setSelectedKitchen(kitchen);
    setColorPickerVisible(true);
  };

  const handleColorChanged = (newColor: string) => {
    if (selectedKitchen) {
      setKitchens((prev) =>
        prev.map((k) =>
          k.id === selectedKitchen.id ? { ...k, color: newColor } : k
        )
      );
    }
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
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/home/user")}
          >
            {profile?.profile_image_url ? (
              <Image
                source={{ uri: profile.profile_image_url }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>
                  {profile?.username.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

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
              </TouchableOpacity>

              {/* Color edit button */}
              <TouchableOpacity
                style={[
                  styles.colorEditButton,
                  { backgroundColor: kitchen.color || "#FFFFFF" },
                ]}
                onPress={() => handleColorEdit(kitchen)}
              >
                <Text style={styles.colorEditIcon}>✎</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
          {/* Vasak pool - Add button */}
          <View style={styles.leftSide}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                console.log("Add kitchen");
              }}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          {/* Keskel - HomeButton */}
          <View style={styles.centerSide}>
            <HomeButton />
          </View>
          
          {/* Parem pool - ProfileButton */}
          <View style={styles.rightSide}>
            <TouchableOpacity
              style={styles.profileButtonBottom}
              onPress={() => router.push("/home/user")}
            >
              {profile?.profile_image_url ? (
                <Image
                  source={{ uri: profile.profile_image_url }}
                  style={styles.profileImageSmall}
                />
              ) : (
                <View style={styles.placeholderImageSmall}>
                  <Text style={styles.placeholderTextSmall}>
                    {profile?.username.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

      {selectedKitchen && (
        <KitchenColorPicker
          visible={colorPickerVisible}
          onClose={() => setColorPickerVisible(false)}
          kitchenId={selectedKitchen.id}
          kitchenName={selectedKitchen.name}
          currentColor={selectedKitchen.color}
          onColorChanged={handleColorChanged}
        />
      )}
    </View>
  );
}