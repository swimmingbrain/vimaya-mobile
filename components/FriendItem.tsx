import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Friendship } from "@/services/friendship";
import { router } from "expo-router";
import { colors } from "@/utils/theme";

interface FriendItemProps {
  friend: Friendship;
  onRemove: (friendshipId: number) => void;
  isLoading: boolean;
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, onRemove, isLoading }) => {
  const handlePress = () => {
    router.push({
      pathname: "/friend/" + friend.friendId,
      params: { username: friend.friendUsername },
    });
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.surface2,
      }}
      onPress={handlePress}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              height: 44,
              width: 44,
              borderRadius: 22,
              backgroundColor: colors.cool,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>
              {friend.friendUsername.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={{ color: colors.text, fontWeight: "500", fontSize: 15 }}>
              {friend.friendUsername}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
              Friends since {new Date(friend.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.muted} />
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: colors.error + "20",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 8,
            }}
            onPress={(e) => {
              e.stopPropagation();
              onRemove(friend.id);
            }}
          >
            <Text style={{ color: colors.error, fontWeight: "500", fontSize: 13 }}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default FriendItem;
