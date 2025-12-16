import { supabase } from "@/lib/supabase";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity } from "react-native";

type InviteButtonProps = {
  kitchenId: string;
};

export default function InviteButton({ kitchenId }: InviteButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    setLoading(true);

    try {
      // Generate random token
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

      // Insert invite with 24h expiry
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error } = await supabase
        .from("kitchen_invites")
        .insert({
          kitchen_id: kitchenId,
          token: token,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      // Copy link to clipboard
      const inviteLink = `retseptify://invite?token=${token}`;
      await Clipboard.setStringAsync(inviteLink);

      Alert.alert("Tehtud!", "Kutse link on kopeeritud!");
    } catch (error: any) {
      console.error("Error creating invite:", error);
      Alert.alert("Viga", "Kutse loomine ebaõnnestus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleInvite} disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" color="#333" />
      ) : (
        <Text style={styles.buttonText}>Kutsu</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 117,
    height: 37,
    marginBottom: 10, 
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    fontSize: 30,
    color: "#545454",
    fontWeight: "500",
  },
});