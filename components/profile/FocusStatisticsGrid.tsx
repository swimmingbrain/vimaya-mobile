import React from "react";
import { Text, View } from "react-native";
import { FocusStatistics } from "@/hooks/profile/useProfileScreen";
import { formatFocusTime } from "@/utils/time";

interface FocusStatisticsGridProps {
  stats: FocusStatistics;
}

const FocusStatisticsGrid = ({ stats }: FocusStatisticsGridProps) => (
  <View className="bg-secondary/10 p-4 rounded-lg">
    <Text className="text-secondary text-xl font-bold mb-4">
      Focus Statistics
    </Text>
    <View className="flex-row flex-wrap justify-between">
      <View className="w-[48%] bg-primary/10 p-4 rounded-lg mb-4">
        <Text className="text-secondary/70 text-sm">{`Today's Focus Time`}</Text>
        <Text className="text-secondary text-2xl font-bold">
          {formatFocusTime(stats.today)}
        </Text>
      </View>
      <View className="w-[48%] bg-primary/10 p-4 rounded-lg mb-4">
        <Text className="text-secondary/70 text-sm">This Week</Text>
        <Text className="text-secondary text-2xl font-bold">
          {formatFocusTime(stats.week)}
        </Text>
      </View>
      <View className="w-[48%] bg-primary/10 p-4 rounded-lg mb-4">
        <Text className="text-secondary/70 text-sm">All Time Focus</Text>
        <Text className="text-secondary text-2xl font-bold">
          {formatFocusTime(stats.allTime)}
        </Text>
      </View>
      <View className="w-[48%] bg-primary/10 p-4 rounded-lg mb-4">
        <Text className="text-secondary/70 text-sm">Completed Tasks</Text>
        <Text className="text-secondary text-2xl font-bold">
          {stats.completedTasks}
        </Text>
      </View>
    </View>
  </View>
);

export default FocusStatisticsGrid;
