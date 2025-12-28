import React from "react";
import { Text, View } from "react-native";
import FriendRequest from "@/components/FriendRequest";
import { Friendship } from "@/services/friendship";
import { colors } from "@/utils/theme";

interface FriendRequestsListProps {
  requests: Friendship[];
  onAccept: (friendshipId: number) => void;
  onReject: (friendshipId: number) => void;
  isLoading: boolean;
}

const FriendRequestsList = ({ requests, onAccept, onReject, isLoading }: FriendRequestsListProps) => (
  <View>
    <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
      Friend Requests
    </Text>
    {requests.length === 0 ? (
      <View style={{ backgroundColor: colors.surface, padding: 20, borderRadius: 12, alignItems: "center" }}>
        <Text style={{ color: colors.muted }}>You don't have any pending friend requests.</Text>
      </View>
    ) : (
      requests.map((request) => (
        <FriendRequest
          key={request.id}
          request={request}
          onAccept={onAccept}
          onReject={onReject}
          isLoading={isLoading}
        />
      ))
    )}
  </View>
);

export default FriendRequestsList;
