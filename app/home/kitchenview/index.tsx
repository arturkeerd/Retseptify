import ColorPickerModal from "@/components/ColorPickerModal";
import HomeButton from "@/components/HomeButton";
import ProfileButton from "@/components/ProfileButton";
import { APP_COLORS } from "@/components/colors";
import { supabase } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
  color: string;
  image_url: string | null;
  owner_user_id: string;
};

type Member = {
  user_id: string;
  role: string;
  users: {
    username: string;
    profile_image_url: string | null;
  };
};

export default function KitchenView() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  useEffect(() => {
    loadKitchen();
  }, [id]);

  const loadKitchen = async () => {
    if (!id) return;
    
    setLoading(true);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Error", "Not logged in");
      setLoading(false);
      return;
    }
    setCurrentUserId(user.id);

    // Load kitchen details
    const { data: kitchenData, error: kitchenError } = await supabase
      .from("kitchens")
      .select("*")
      .eq("id", id)
      .single();

    if (kitchenError || !kitchenData) {
      console.error("Error loading kitchen:", kitchenError);
      Alert.alert("Error", "Kitchen not found");
      setLoading(false);
      return;
    }

    setKitchen(kitchenData as Kitchen);

    // Load members
    const { data: membersData, error: membersError } = await supabase
      .from("kitchen_members")
      .select(`
        user_id,
        role,
        users (
          username,
          profile_image_url
        )
      `)
      .eq("kitchen_id", id);

    if (membersError) {
      console.error("Error loading members:", membersError);
    } else if (membersData) {
      setMembers(membersData as unknown as Member[]);
    }

    setLoading(false);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Camera roll permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!kitchen) return;

    setUploading(true);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split(".").pop();
      const fileName = `${kitchen.id}-${Date.now()}.${fileExt}`;
      const filePath = `kitchen-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("kitchens")
        .update({ image_url: publicUrl })
        .eq("id", kitchen.id);

      if (updateError) throw updateError;

      setKitchen({ ...kitchen, image_url: publicUrl });
      Alert.alert("Success", "Kitchen image updated!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleColorSelect = async (color: string) => {
    if (!kitchen) return;

    const { error } = await supabase
      .from("kitchens")
      .update({ color })
      .eq("id", kitchen.id);

    if (error) {
      console.error("Error updating color:", error);
      Alert.alert("Error", "Failed to update color");
    } else {
      setKitchen({ ...kitchen, color });
      setColorPickerVisible(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!kitchen || !currentUserId) return;

    // Only owner can remove members
    if (kitchen.owner_user_id !== currentUserId) {
      Alert.alert("Error", "Only owner can remove members");
      return;
    }

    Alert.alert(
      "Remove member",
      "Are you sure you want to remove this member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("kitchen_members")
              .delete()
              .eq("kitchen_id", kitchen.id)
              .eq("user_id", userId);

            if (error) {
              console.error("Error removing member:", error);
              Alert.alert("Error", "Failed to remove member");
            } else {
              setMembers(members.filter(m => m.user_id !== userId));
            }
          },
        },
      ]
    );
  };

  const isOwner = kitchen && currentUserId === kitchen.owner_user_id;

  if (loading || !kitchen) {
    return (
      <View style={[styles.container, { backgroundColor: kitchen?.color || "#E8E6E1" }]}>
        <ActivityIndicator size="large" color="#8B7355" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: kitchen.color }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Kitchen Image */}
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={pickImage}
          disabled={uploading}
        >
          {kitchen.image_url ? (
            <Image
              source={{ uri: kitchen.image_url }}
              style={styles.kitchenImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>
                {kitchen.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}

          {/* Color picker button */}
          <TouchableOpacity
            style={styles.colorButton}
            onPress={() => setColorPickerVisible(true)}
          >
            <View style={[styles.colorPreview, { backgroundColor: kitchen.color }]} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Invite Button (placeholder for now) */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Kutsu</Text>
        </TouchableOpacity>

        {/* Kitchen Name Button (placeholder - will add modal later) */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>{kitchen.name}</Text>
        </TouchableOpacity>

        {/* Members List */}
        <View style={styles.membersContainer}>
          {members.map((member) => {
            const isOwnerMember = member.user_id === kitchen.owner_user_id;
            
            return (
              <View key={member.user_id} style={styles.memberRow}>
                <Text style={styles.memberName}>
                  {member.users.username}
                  {isOwnerMember && " 👑"}
                </Text>
                
                {!isOwnerMember && isOwner && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveMember(member.user_id)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <View style={styles.leftSide}>
          <HomeButton />
        </View>
        <View style={styles.rightSide}>
          <ProfileButton />
        </View>
      </View>

      {/* Color Picker Modal */}
      <ColorPickerModal
        visible={colorPickerVisible}
        onClose={() => setColorPickerVisible(false)}
        onSelectColor={handleColorSelect}
        currentColor={kitchen.color}
        colors={APP_COLORS}
        title={kitchen.name}
        subtitle="Vali värv"
      />
    </View>
  );
}