import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Friendship } from "@/types/types";
import { colors } from "@/utils/theme";

interface FriendsPreviewProps {
  friends: Friendship[];
  isLoading: boolean;
  error: string | null;
}

const FriendsPreview = ({ friends, isLoading, error }: FriendsPreviewProps) => {
  const router = useRouter();
  const friendCount = friends.length;

  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>
          Friends ({friendCount})
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.cool,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
          }}
          onPress={() => router.replace("/friends/Friends" as any)}
        >
          <Text style={{ color: colors.text, fontWeight: "500", fontSize: 13 }}>View All</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <ActivityIndicator color={colors.warm} />
      ) : error ? (
        <View style={{ backgroundColor: colors.error + "20", padding: 12, borderRadius: 10 }}>
          <Text style={{ color: colors.error }}>{error}</Text>
        </View>
      ) : friendCount === 0 ? (
        <View style={{ backgroundColor: colors.surface, padding: 20, borderRadius: 12, alignItems: "center" }}>
          <Text style={{ color: colors.muted }}>You don't have any friends yet.</Text>
        </View>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {friends.slice(0, 4).map((friend) => (
            <TouchableOpacity
              key={friend.id}
              style={{
                width: "48%",
                backgroundColor: colors.surface,
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.surface2,
              }}
              onPress={() =>
                router.push({
                  pathname: "/friend/[id]",
                  params: {
                    id: String(friend.id),
                    friendUserId: friend.friendId,
                    username: friend.friendUsername
                  },
                })
              }
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    height: 32,
                    width: 32,
                    borderRadius: 16,
                    backgroundColor: colors.cool,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: "700" }}>
                    {friend.friendUsername.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={{ color: colors.text, fontWeight: "500", fontSize: 14 }} numberOfLines={1}>
                  {friend.friendUsername}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {friendCount > 4 && (
            <View
              style={{
                width: "48%",
                backgroundColor: colors.surface,
                padding: 14,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.surface2,
              }}
            >
              <Text style={{ color: colors.muted }}>+{friendCount - 4} more</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default FriendsPreview;
