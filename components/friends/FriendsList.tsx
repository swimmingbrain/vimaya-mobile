import React from "react";
import { Text, View } from "react-native";
import FriendItem from "@/components/FriendItem";
import { Friendship } from "@/services/friendship";

interface FriendsListProps {
  friends: Friendship[];
  onRemove: (friendshipId: number) => void;
  isLoading: boolean;
}

const FriendsList = ({
  friends,
  onRemove,
  isLoading,
}: FriendsListProps) => (
  <View>
    <Text className="text-secondary text-xl font-bold mb-4">
      Your Friends
    </Text>
    {friends.length === 0 ? (
      <Text className="text-secondary/70">
        {`You don't have any friends yet.`}
      </Text>
    ) : (
      friends.map((friend) => (
        <FriendItem
          key={friend.id}
          friend={friend}
          onRemove={onRemove}
          isLoading={isLoading}
        />
      ))
    )}
  </View>
);

export default FriendsList;
