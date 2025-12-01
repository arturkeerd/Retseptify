import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function NotificationButton() {
  const router = useRouter();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    checkUnreadNotifications();
  }, []);

  const checkUnreadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_read", false)
      .limit(1);

    if (!error && data && data.length > 0) {
      setHasUnread(true);
    } else {
      setHasUnread(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => router.push("/home/user/notifications")}
      >
        <Image 
          source={require("@/assets/images/chat_bubble.png")} 
          style={styles.icon}
        />
      </TouchableOpacity>
      
      {hasUnread && <View style={styles.badge} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  iconButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(169, 149, 108, 0.75)",
    borderWidth: 3,
    borderColor: "#5D4037",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF0000",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});