import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { sendFriendRequest } from "@/services/friendship";
import { colors } from "@/utils/theme";

interface FriendRequestFormProps {
  onRequestSent: () => void;
}

const FriendRequestForm: React.FC<FriendRequestFormProps> = ({ onRequestSent }) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await sendFriendRequest(username.trim());
      setSuccess(response.message);
      setUsername("");
      onRequestSent();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to send friend request");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.surface2,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 17, fontWeight: "600", marginBottom: 16 }}>
        Add Friend
      </Text>

      <View style={{ marginBottom: 12 }}>
        <TextInput
          style={{
            backgroundColor: colors.bgAlt,
            padding: 14,
            borderRadius: 10,
            color: colors.text,
            fontSize: 15,
            borderWidth: 1,
            borderColor: colors.surface2,
          }}
          placeholder="Enter username"
          placeholderTextColor={colors.muted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      {error ? (
        <View style={{ backgroundColor: colors.error + "20", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ color: colors.error, fontSize: 13 }}>{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View style={{ backgroundColor: colors.success + "20", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ color: colors.success, fontSize: 13 }}>{success}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={{
          backgroundColor: colors.cool,
          padding: 14,
          borderRadius: 10,
          alignItems: "center",
        }}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>Send Friend Request</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default FriendRequestForm;
