import React from "react";
import { Text, View } from "react-native";
import FriendRequest from "@/components/FriendRequest";
import { Friendship } from "@/services/friendship";

interface FriendRequestsListProps {
  requests: Friendship[];
  onAccept: (friendshipId: number) => void;
  onReject: (friendshipId: number) => void;
  isLoading: boolean;
}

const FriendRequestsList = ({
  requests,
  onAccept,
  onReject,
  isLoading,
}: FriendRequestsListProps) => (
  <View>
    <Text className="text-secondary text-xl font-bold mb-4">
      Friend Requests
    </Text>
    {requests.length === 0 ? (
      <Text className="text-secondary/70">
        {`You don't have any pending friend requests.`}
      </Text>
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
