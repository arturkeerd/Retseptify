import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

export default function InviteHandler() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    handleInvite();
  }, [token]);

  const handleInvite = async () => {
    if (!token) {
      Alert.alert("Viga", "Vigane kutse link");
      router.replace("/");
      return;
    }

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Save token and redirect to login
      await AsyncStorage.setItem("pending_invite_token", token as string);
      router.replace("/");
      return;
    }

    // User is logged in, process invite
    await processInvite(user.id, token as string);
  };

  const processInvite = async (userId: string, inviteToken: string) => {
    try {
      // Get invite details
      const { data: invite, error: inviteError } = await supabase
        .from("kitchen_invites")
        .select("kitchen_id, expires_at")
        .eq("token", inviteToken)
        .single();

      if (inviteError || !invite) {
        Alert.alert("Viga", "Kutse link ei ole kehtiv");
        router.replace("/home");
        return;
      }

      // Check if expired
      if (new Date(invite.expires_at) < new Date()) {
        Alert.alert("Viga", "Kutse link on aegunud");
        router.replace("/home");
        return;
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from("kitchen_members")
        .select("id")
        .eq("kitchen_id", invite.kitchen_id)
        .eq("user_id", userId)
        .single();

      if (existing) {
        Alert.alert("Info", "Sa oled juba selle köögi liige!");
        router.replace(`/home/kitchenview?id=${invite.kitchen_id}`);
        return;
      }

      // Add user as viewer
      const { error: memberError } = await supabase
        .from("kitchen_members")
        .insert({
          kitchen_id: invite.kitchen_id,
          user_id: userId,
          role: "viewer",
        });

      if (memberError) {
        console.error("Error adding member:", memberError);
        Alert.alert("Viga", "Liitumine ebaõnnestus");
        router.replace("/home");
        return;
      }

      Alert.alert("Õnnestus!", "Oled nüüd köögi liige!");
      router.replace(`/home/kitchenview?id=${invite.kitchen_id}`);
    } catch (error) {
      console.error("Error processing invite:", error);
      Alert.alert("Viga", "Midagi läks valesti");
      router.replace("/home");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E8E6E1" }}>
      <ActivityIndicator size="large" color="#8B7355" />
      <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
        Töötlen kutset...
      </Text>
    </View>
  );
}