// app/home/notifications/index.tsx
import HomeButton from "@/components/HomeButton";
import NotificationActionModal from "@/components/NotificationActionModal";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import styles from "./styles";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  recipe_id: string;
  kitchen_id: string;
  is_read: boolean;
  created_at: string;
  recipes: {
    title: string;
    image_url: string | null;
  } | null;
  kitchens: {
    name: string;
    color: string;
  } | null;
};

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [userProfile, setUserProfile] = useState<{
    username: string;
    profile_image_url: string | null;
  } | null>(null);

  useEffect(() => {
    loadNotifications();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("users")
      .select("username, profile_image_url")
      .eq("id", user.id)
      .single();

    if (data) {
      setUserProfile(data);
    }
  };

  const loadNotifications = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        title,
        body,
        recipe_id,
        kitchen_id,
        is_read,
        created_at,
        recipes (
          title,
          image_url
        ),
        kitchens (
          name,
          color
        )
      `)
      .eq("user_id", user.id)
      .eq("type", "recipe_change_request")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading notifications:", error);
    } else if (data) {
      setNotifications(data as unknown as Notification[]);
    }

    setLoading(false);
  };
    const handleBackgroundPress = () => {
      setModalVisible(false);
    };

  const handleNotificationPress = (notification: Notification) => {
  setSelectedNotification(notification);
  setModalVisible(true);
};

  const handleApprove = async () => {
  if (!selectedNotification) return;

  // Mark as read
  if (!selectedNotification.is_read) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", selectedNotification.id);

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === selectedNotification.id ? { ...n, is_read: true } : n
      )
    );
  }

  setModalVisible(false);
  // TODO: Navigate to recipe edit
  // router.push(`/recipe/${selectedNotification?.recipe_id}/edit`);
};

  const handleReject = async () => {
  if (!selectedNotification) return;

  // Mark as read
  if (!selectedNotification.is_read) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", selectedNotification.id);

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === selectedNotification.id ? { ...n, is_read: true } : n
      )
    );
  }

  setModalVisible(false);
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
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Teavitusi pole</Text>
          </View>
        }
        renderItem={({ item }) => (
  <TouchableOpacity
    style={[
      styles.notificationItem,
      { backgroundColor: item.kitchens?.color || "#FFFFFF" },
    ]}
    onPress={() => handleNotificationPress(item)}
  >
    {!item.is_read && <View style={styles.unreadDot} />}
    <Text style={styles.recipeName}>
      {item.recipes?.title || "Retsept"}
    </Text>
    {userProfile?.profile_image_url && (
      <Image
        source={{ uri: userProfile.profile_image_url }}
        style={styles.userImage}
      />
    )}
  </TouchableOpacity>
)}
      />

      <View style={styles.bottomContainer}>
          {/* Vasak pool - tühi */}
          <View style={styles.leftSide}>
            {/* Tühi */}
          </View>
          
          {/* Keskel - HomeButton */}
          <View style={styles.centerSide}>
            <HomeButton />
          </View>
          
          {/* Parem pool - ProfileButton */}
          <View style={styles.rightSide}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push("/home/user")}
            >
              {userProfile?.profile_image_url ? (
                <Image
                  source={{ uri: userProfile.profile_image_url }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>
                    {userProfile?.username.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

      <NotificationActionModal
  visible={modalVisible}
  onClose={async () => {
    if (!selectedNotification) return;
    
    // Mark as read
    if (!selectedNotification.is_read) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", selectedNotification.id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === selectedNotification.id ? { ...n, is_read: true } : n
        )
      );
    }
    
    setModalVisible(false);
  }}
  onBackgroundPress={handleBackgroundPress}
  onApprove={handleApprove}
  onReject={handleReject}
/>
    </View>
  );
}