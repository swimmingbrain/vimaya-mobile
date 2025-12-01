import React from "react";
import { Text, View } from "react-native";
import { UserProfile } from "@/types/types";

interface ProfileHeaderProps {
  user: UserProfile | null;
}

const ProfileHeader = ({ user }: ProfileHeaderProps) => (
  <View className="bg-secondary/10 p-4 rounded-lg">
    <View className="flex-row justify-between">
      <View className="flex-row items-center">
        <View className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
          <Text className="text-primary text-2xl font-bold">
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </Text>
        </View>
        <View className="ml-4">
          <Text className="text-secondary text-xl font-bold">
            {user?.username || "Loading..."}
          </Text>
          <Text className="text-secondary/70">
            {user?.email || "Loading..."}
          </Text>
        </View>
      </View>
      {user && (
        <View className="flex flex-col justify-center">
          <Text className="text-secondary text-base font-bold">
            Level {user.level}
          </Text>
          <Text className="text-secondary text-base">{user.xp} XP</Text>
        </View>
      )}
    </View>
  </View>
);

export default ProfileHeader;
