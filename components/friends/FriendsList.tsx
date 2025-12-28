import React from "react";
import { Text, View } from "react-native";
import FriendItem from "@/components/FriendItem";
import { Friendship } from "@/services/friendship";
import { colors } from "@/utils/theme";

interface FriendsListProps {
  friends: Friendship[];
  onRemove: (friendshipId: number) => void;
  isLoading: boolean;
}

const FriendsList = ({ friends, onRemove, isLoading }: FriendsListProps) => (
  <View>
    <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
      Your Friends
    </Text>
    {friends.length === 0 ? (
      <View style={{ backgroundColor: colors.surface, padding: 20, borderRadius: 12, alignItems: "center" }}>
        <Text style={{ color: colors.muted }}>You don't have any friends yet.</Text>
      </View>
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
