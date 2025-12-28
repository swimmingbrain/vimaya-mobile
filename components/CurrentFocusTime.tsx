import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getDailyStatistics } from "@/services/statistics";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/utils/theme";

const CurrentFocusTime = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [todayStats, setTodayStats] = useState<number>(0);
  const [weeklyStats, setWeeklyStats] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated) {
        setTodayStats(0);
        setWeeklyStats(0);
        return;
      }
      try {
        const stats = await getDailyStatistics(new Date());
        if (stats.length > 0) {
          setTodayStats(stats[0].totalFocusTime);
          const weeklyTotal = stats.reduce(
            (acc, curr) => acc + curr.totalFocusTime,
            0
          );
          setWeeklyStats(weeklyTotal);
        }
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      }
    };

    fetchStats();
  }, [isAuthenticated]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours + "h " + minutes + "m";
  };

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>Focus Time</Text>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          onPress={() => router.replace("/statistics/Statistics" as any)}
        >
          <Text style={{ color: colors.muted, fontSize: 14 }}>All Statistics</Text>
          <Ionicons name="arrow-forward" color={colors.muted} size={16} />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.surface2 }}>
          <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 6 }}>Today</Text>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>{formatTime(todayStats)}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.surface2 }}>
          <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 6 }}>This week</Text>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>{formatTime(weeklyStats)}</Text>
        </View>
      </View>
    </View>
  );
};

export default CurrentFocusTime;
