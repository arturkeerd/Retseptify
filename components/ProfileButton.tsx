import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileButton() {
  const router = useRouter();
  const { hasUnread } = useUnreadNotifications();
  
  const [profileAvatar, setProfileAvatar] = useState<{
    initial: string;
    imageUrl: string | null;
  } | null>(null);

  useEffect(() => {
    loadAvatar();
  }, []);

  const loadAvatar = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.circleButton}
        activeOpacity={0.8}
        onPress={() => router.push("/home/user")}
      >
        {profileAvatar?.imageUrl ? (
          <Image
            source={{ uri: profileAvatar.imageUrl }}
            style={{ width: "100%", height: "100%", borderRadius: 999 }}
          />
        ) : (
          <Text style={styles.circleButtonText}>
            {profileAvatar?.initial ?? "P"}
          </Text>
        )}
      </TouchableOpacity>
      
      {hasUnread && <View style={styles.badge} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  circleButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#DDD",
    alignItems: "center",
    justifyContent: "center",
  },
  circleButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FF0000",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});