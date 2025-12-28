import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Friendship } from "@/services/friendship";
import { colors } from "@/utils/theme";

interface FriendRequestProps {
  request: Friendship;
  onAccept: (friendshipId: number) => void;
  onReject: (friendshipId: number) => void;
  isLoading: boolean;
}

const FriendRequest: React.FC<FriendRequestProps> = ({ request, onAccept, onReject, isLoading }) => {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.surface2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              height: 44,
              width: 44,
              borderRadius: 22,
              backgroundColor: colors.warm,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>
              {request.friendUsername.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={{ color: colors.text, fontWeight: "500", fontSize: 15 }}>
              {request.friendUsername}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
              {new Date(request.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.muted} />
        ) : (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.success + "30",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 8,
              }}
              onPress={() => onAccept(request.id)}
            >
              <Text style={{ color: colors.success, fontWeight: "500", fontSize: 13 }}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: colors.error + "20",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 8,
              }}
              onPress={() => onReject(request.id)}
            >
              <Text style={{ color: colors.error, fontWeight: "500", fontSize: 13 }}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default FriendRequest;
