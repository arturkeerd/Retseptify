import BackgroundColorPicker from "@/components/BackgroundColorPicker";
import ChangeNameModal from "@/components/ChangeNameModal";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import { supabase } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import HomeButton from "@/components/HomeButton";
import NotificationButton from "@/components/NotificationButton";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import styles from "./styles";

type UserProfile = {
  id: string;
  username: string;
  email: string;
  profile_image_url: string | null;
  created_at: string;
};

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#E8E6E1");
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [changeNameVisible, setChangeNameVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Error", "Not logged in");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", error.message);
    } else if (data) {
      setProfile(data as UserProfile);
      setUsername(data.username);
    }

    setLoading(false);
  };

  const handleChangePassword = () => {
  setChangePasswordVisible(true);
};

const pickImage = async () => {
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permissionResult.granted === false) {
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
  if (!profile) return;

  setUploading(true);

  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileExt = uri.split(".").pop();
    const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, blob);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("users")
      .update({ profile_image_url: publicUrl })
      .eq("id", profile.id);

    if (updateError) throw updateError;

    setProfile({ ...profile, profile_image_url: publicUrl });
    Alert.alert("Success", "Profile picture updated!");
  } catch (error: any) {
    console.error("Error uploading image:", error);
    Alert.alert("Error", error.message);
  } finally {
    setUploading(false);
  }
};

  const saveUsername = async () => {
    if (!profile) return;

    if (username.trim() === "") {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ username: username.trim() })
      .eq("id", profile.id);

    if (error) {
      console.error("Error updating username:", error);
      Alert.alert("Error", error.message);
    } else {
      setProfile({ ...profile, username: username.trim() });
      Alert.alert("Success", "Username updated!");
    }
  };


  const handleManageKitchens = () => {
    router.push("/home/kitchens");
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.replace("/");
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B7355" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>No profile found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={pickImage}
          disabled={uploading}
        >
          {profile.profile_image_url ? (
            <Image
              source={{ uri: profile.profile_image_url }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>
                {profile.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => setColorPickerVisible(true)}
          >
            <View style={[styles.colorPreview, { backgroundColor: backgroundColor }]} />
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.usernameInput}
          onPress={() => setChangeNameVisible(true)}
        >
          <Text style={styles.usernameText}>{username}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Muuda parool</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleManageKitchens}>
          <Text style={styles.buttonText}>Köögid</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Logi välja</Text>
        </TouchableOpacity>

        <View style={styles.bottomContainer}>
          {/* Vasak pool - tühi või nupp */}
          <View style={styles.leftSide}>
            {/* Tühi praegu */}
          </View>
          
          {/* Keskel - ALATI HomeButton */}
          <View style={styles.centerSide}>
            <HomeButton />
          </View>
          
          {/* Parem pool - NotificationButton */}
          <View style={styles.rightSide}>
            <NotificationButton />
          </View>
        </View>
      </View>

      <BackgroundColorPicker
        visible={colorPickerVisible}
        onClose={() => setColorPickerVisible(false)}
        onSelectColor={setBackgroundColor}
        currentColor={backgroundColor}
      />

      <ChangeNameModal
        visible={changeNameVisible}
        onClose={() => setChangeNameVisible(false)}
        currentName={username}
        onNameChanged={(newName) => {
          setUsername(newName);
          if (profile) {
            setProfile({ ...profile, username: newName });
          }
        }}
      />

      <ChangePasswordModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
      />
    </View>
  );
}