import React from "react";
import { Text, View } from "react-native";

interface AchievementsSummaryProps {
  longestSession: number;
  daysWithFocus: number;
  formatTime: (seconds: number) => string;
}

const AchievementsSummary = ({
  longestSession,
  daysWithFocus,
  formatTime,
}: AchievementsSummaryProps) => (
  <View className="bg-secondary/10 p-4 rounded-lg">
    <Text className="text-secondary text-lg mb-4">Achievements</Text>
    <View className="space-y-4">
      <View className="flex-row justify-between items-center">
        <Text className="text-secondary">Longest Focus Session</Text>
        <Text className="text-secondary font-bold">
          {formatTime(longestSession)}
        </Text>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="text-secondary">Days in Focus</Text>
        <Text className="text-secondary font-bold">
          {daysWithFocus} day(s)
        </Text>
      </View>
    </View>
  </View>
);

export default AchievementsSummary;
