import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Friendship } from "@/types/types";

interface FriendsPreviewProps {
  friends: Friendship[];
  isLoading: boolean;
  error: string | null;
}

const FriendsPreview = ({
  friends,
  isLoading,
  error,
}: FriendsPreviewProps) => {
  const router = useRouter();
  const friendCount = friends.length;

  return (
    <View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-secondary text-xl font-bold">
          Friends ({friendCount})
        </Text>
        <TouchableOpacity
          className="bg-primary px-3 py-1 rounded"
          onPress={() => router.push("/friends/Friends")}
        >
          <Text className="text-white font-medium">View All</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <ActivityIndicator color="#c1c1c1" />
      ) : error ? (
        <Text className="text-red-500">{error}</Text>
      ) : friendCount === 0 ? (
        <Text className="text-secondary/70">
          {`You don't have any friends yet.`}
        </Text>
      ) : (
        <View className="flex-row flex-wrap">
          {friends.slice(0, 4).map((friend) => (
            <TouchableOpacity
              key={friend.id}
              className="w-[48%] bg-secondary/10 p-4 rounded-lg mb-4 mr-[4%]"
              onPress={() =>
                router.push({
                  pathname: `/friend/${friend.friendId}`,
                  params: { username: friend.friendUsername },
                })
              }
            >
              <View className="flex-row items-center space-x-6">
                <View className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <Text className="text-primary text-sm font-bold">
                    {friend.friendUsername.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-secondary font-medium ml-2">
                  {friend.friendUsername}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {friendCount > 4 && (
            <View className="w-[48%] bg-secondary/10 p-4 rounded-lg mb-4 mr-[4%] items-center justify-center">
              <Text className="text-secondary/70">
                +{friendCount - 4} more
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default FriendsPreview;
