import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import styles from "./styles";

type Kitchen = {
  id: string;
  name: string;
  unreadCount: number;
  lastMessage?: string;
  color: string;
};

// Värvid köökidele (nagu Figmas)
const KITCHEN_COLORS = [
  "#FFB3BA", // punane
  "#FFFFBA", // kollane
  "#FFFFFF", // valge
  "#B0B0B0", // hall
  "#B0B0B0", // hall
  "#FFB3BA", // roosa
  "#FFB3BA", // roosa
];

export default function Notifications() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileAvatar, setProfileAvatar] = useState<{
    initial: string;
    imageUrl: string | null;
  } | null>(null);

  useEffect(() => {
    loadKitchens();
    loadAvatar();
  }, []);

  const loadAvatar = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("users")
      .select("username, profile_image_url")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      console.error("Error loading avatar:", error);
      return;
    }

    const username: string = data.username;
    const initial = username.charAt(0).toUpperCase();

    setProfileAvatar({
      initial,
      imageUrl: data.profile_image_url ?? null,
    });
  };

  const loadKitchens = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Lae kõik köögid kus kasutaja on liige
    const { data, error } = await supabase
      .from("kitchen_members")
      .select("kitchens(id, name)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading kitchens:", error);
    } else if (data) {
      const kitchenList: Kitchen[] = data
        .map((item: any, index: number) => ({
          id: item.kitchens.id,
          name: item.kitchens.name,
          unreadCount: 0, // Hiljem saad lisada tegeliku lugemata sõnumite arvu
          color: KITCHEN_COLORS[index % KITCHEN_COLORS.length],
        }))
        .filter((k: any) => k !== null);
      setKitchens(kitchenList);
    }

    setLoading(false);
  };

  const handleKitchenPress = (kitchen: Kitchen) => {
    console.log("Selected kitchen:", kitchen);
    // Hiljem saad navigeerida kitchen-specific chat lehele
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
      <FlatList
        data={kitchens}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.kitchenItem, { backgroundColor: item.color }]}
            onPress={() => handleKitchenPress(item)}
          >
            <Text style={styles.kitchenName}>{item.name}</Text>
            <View style={styles.avatarContainer}>
              {profileAvatar?.imageUrl ? (
                <Image
                  source={{ uri: profileAvatar.imageUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {profileAvatar?.initial ?? "?"}
                  </Text>
                </View>
              )}
              {item.unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/home")}
        >
          <Image
            source={require("@/assets/images/Home.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/home/user")}
        >
          {profileAvatar?.imageUrl ? (
            <Image
              source={{ uri: profileAvatar.imageUrl }}
              style={styles.profileIcon}
            />
          ) : (
            <View style={styles.profileIconPlaceholder}>
              <Text style={styles.profileIconText}>
                {profileAvatar?.initial ?? "P"}
              </Text>
            </View>
          )}
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
}