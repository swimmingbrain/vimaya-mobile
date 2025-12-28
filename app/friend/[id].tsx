import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useLocalSearchParams, Stack } from "expo-router";
import { getDailyStatistics } from "@/services/statistics";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFriends } from "@/services/friendship";
import { colors } from "@/utils/theme";

interface FriendProfileData {
  username: string;
  level: number;
  xp: number;
}

const FriendProfile = () => {
  const { id, username } = useLocalSearchParams();
  const [user, setUser] = useState<FriendProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statistics, setStatistics] = useState<{
    today: number;
    week: number;
    allTime: number;
    completedTasks: number;
  }>({
    today: 0,
    week: 0,
    allTime: 0,
    completedTasks: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const friends = await getFriends();

        const friendship = friends.find(f =>
          f.id === Number(id) ||
          (f.userId === id || f.friendId === id)
        );

        if (!friendship) {
          throw new Error("Friendship not found");
        }

        let stats: any[] = [];

        console.log("Trying with friendId:", friendship.friendId);
        stats = await getDailyStatistics(undefined, friendship.friendId);

        if (stats.length === 0) {
          console.log("No stats found with friendId, trying with userId:", friendship.userId);
          stats = await getDailyStatistics(undefined, friendship.userId);
        }

        const userData = stats[0] || { username: username as string, level: 1, xp: 0 };

        const today = new Date();
        const todayStats = stats.find(stat =>
          new Date(stat.date).toDateString() === today.toDateString()
        );
        const todayFocusTime = todayStats?.totalFocusTime || 0;

        const weekStart = new Date();
        weekStart.setDate(today.getDate() - today.getDay() + 1);
        const weekStats = stats.filter(stat =>
          new Date(stat.date) >= weekStart && new Date(stat.date) <= today
        );
        const weekFocusTime = weekStats.reduce((acc, curr) => acc + curr.totalFocusTime, 0);

        const allTimeFocusTime = stats.reduce((acc, curr) => acc + curr.totalFocusTime, 0);

        setUser({
          username: userData.username || username as string || "Friend",
          level: userData.level || 1,
          xp: userData.xp || 0
        });

        setStatistics({
          today: todayFocusTime,
          week: weekFocusTime,
          allTime: allTimeFocusTime,
          completedTasks: 0
        });
      } catch (error) {
        console.error("Failed to load data:", error);
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, username]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <ActivityIndicator size="large" color={colors.warm} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <Text style={{ color: colors.error }}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ backgroundColor: colors.bg }}>
        <View style={{ gap: 20, paddingHorizontal: 16, paddingVertical: 16 }}>
          <Header title="Friend Profile" icon="arrow-back" />

          <View
            style={{
              backgroundColor: colors.surface,
              padding: 20,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.surface2,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    height: 64,
                    width: 64,
                    borderRadius: 32,
                    backgroundColor: colors.cool,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>
                    {user?.username
                      ? user.username.charAt(0).toUpperCase()
                      : "U"}
                  </Text>
                </View>
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
                    {user?.username || "Loading..."}
                  </Text>
                </View>
              </View>
              {user && (
                <View style={{ alignItems: "flex-end" }}>
                  <View
                    style={{
                      backgroundColor: colors.warm,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
                      Level {user.level}
                    </Text>
                  </View>
                  <Text style={{ color: colors.muted, fontSize: 14 }}>{user.xp} XP</Text>
                </View>
              )}
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              padding: 20,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.surface2,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 16 }}>
              Focus Statistics
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              <View
                style={{
                  width: "48%",
                  backgroundColor: colors.bgAlt,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.surface2,
                }}
              >
                <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 6 }}>
                  {"Todays Focus"}
                </Text>
                <Text style={{ color: colors.warm, fontSize: 22, fontWeight: "700" }}>
                  {formatTime(statistics.today)}
                </Text>
              </View>
              <View
                style={{
                  width: "48%",
                  backgroundColor: colors.bgAlt,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.surface2,
                }}
              >
                <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 6 }}>This Week</Text>
                <Text style={{ color: colors.cool, fontSize: 22, fontWeight: "700" }}>
                  {formatTime(statistics.week)}
                </Text>
              </View>
              <View
                style={{
                  width: "48%",
                  backgroundColor: colors.bgAlt,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.surface2,
                }}
              >
                <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 6 }}>
                  All Time Focus
                </Text>
                <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>
                  {formatTime(statistics.allTime)}
                </Text>
              </View>
              <View
                style={{
                  width: "48%",
                  backgroundColor: colors.bgAlt,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.surface2,
                }}
              >
                <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 6 }}>
                  Completed Tasks
                </Text>
                <Text style={{ color: colors.success, fontSize: 22, fontWeight: "700" }}>
                  {statistics.completedTasks}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FriendProfile;
