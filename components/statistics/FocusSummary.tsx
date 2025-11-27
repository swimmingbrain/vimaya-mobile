import React from "react";
import { Text, View } from "react-native";

interface FocusSummaryProps {
  today: number;
  currentWeek: number;
  formatTime: (seconds: number) => string;
}

const FocusSummary = ({
  today,
  currentWeek,
  formatTime,
}: FocusSummaryProps) => (
  <View className="bg-secondary/10 p-4 rounded-lg">
    <Text className="text-secondary text-lg mb-4">Daily Statistics</Text>
    <View className="space-y-4">
      <View className="flex-row justify-between items-center">
        <Text className="text-secondary">Focustime today</Text>
        <Text className="text-secondary font-bold">
          {formatTime(today)}
        </Text>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="text-secondary">Focustime this week</Text>
        <Text className="text-secondary font-bold">
          {formatTime(currentWeek)}
        </Text>
      </View>
    </View>
  </View>
);

export default FocusSummary;
