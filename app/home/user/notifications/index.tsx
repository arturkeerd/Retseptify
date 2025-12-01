import HomeButton from "@/components/HomeButton";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
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

  const handleNotificationPress = async (notification: Notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);

    // Mark as read
    if (!notification.is_read) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    }
  };

  const handleApprove = () => {
    // TODO: Navigate to recipe edit
    setModalVisible(false);
    // router.push(`/recipe/${selectedNotification?.recipe_id}/edit`);
  };

  const handleReject = async () => {
    if (!selectedNotification) return;

    // Delete notification
    await supabase
      .from("notifications")
      .delete()
      .eq("id", selectedNotification.id);

    // Remove from local state
    setNotifications((prev) =>
      prev.filter((n) => n.id !== selectedNotification.id)
    );

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
              !item.is_read && styles.unreadItem,
            ]}
            onPress={() => handleNotificationPress(item)}
          >
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

      <View style={styles.bottomButtons}>
        <HomeButton />

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

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleApprove}
            >
              <Text style={styles.modalButtonText}>Muuda retsepti</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalRejectButton}
              onPress={handleReject}
            >
              <Text style={styles.modalRejectText}>
                Ei tule välja nende kogustega
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.rejectIcon}
                onPress={handleReject}
              >
                <Text style={styles.iconText}>✗</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.approveIcon}
                onPress={handleApprove}
              >
                <Text style={styles.iconText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}