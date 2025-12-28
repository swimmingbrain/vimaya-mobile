import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useLocalSearchParams, Stack } from "expo-router";
import { getDailyStatistics, DailyStatisticsDTO } from "@/services/statistics";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFriends } from "@/services/friendship";
import { colors } from "@/utils/theme";
import ComparisonChart from "@/components/statistics/ComparisonChart";
import { format, subDays, startOfWeek } from "date-fns";
import { getActiveFriendSessions } from "@/services/focusSession";

interface FriendProfileData {
  username: string;
  level: number;
  xp: number;
}

const FriendProfile = () => {
  const params = useLocalSearchParams();
  // Handle both array and string params
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const friendUserIdParam = Array.isArray(params.friendUserId) ? params.friendUserId[0] : params.friendUserId;
  const username = Array.isArray(params.username) ? params.username[0] : params.username;
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
  const [weeklyFriendData, setWeeklyFriendData] = useState<number[]>([]);
  const [weeklyMyData, setWeeklyMyData] = useState<number[]>([]);
  const [weekLabels, setWeekLabels] = useState<string[]>([]);
  const [isCurrentlyFocusing, setIsCurrentlyFocusing] = useState(false);
  const [friendUserId, setFriendUserId] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const friends = await getFriends();

        // Find friendship by ID (preferred) or by user IDs
        const friendshipId = Number(id);
        const friendship = friends.find(f =>
          f.id === friendshipId ||
          (friendUserIdParam && (f.userId === friendUserIdParam || f.friendId === friendUserIdParam)) ||
          f.userId === id ||
          f.friendId === id
        );

        console.log("Looking for friendship with id:", id, "friendUserIdParam:", friendUserIdParam);
        console.log("Found friendship:", friendship?.id, friendship?.friendUsername);

        if (!friendship) {
          throw new Error("Friendship not found");
        }

        // Fetch my own statistics first to determine my userId
        const myStats = await getDailyStatistics();

        // Use friendUserIdParam from params if provided, otherwise determine it
        let actualFriendId: string;

        if (friendUserIdParam) {
          // friendUserId was passed directly from the friend list
          actualFriendId = friendUserIdParam;
        } else {
          // Fallback: determine which side of the friendship we're on
          const myUserId = myStats.length > 0 ? myStats[0].userId : null;
          if (myUserId) {
            actualFriendId = friendship.userId === myUserId ? friendship.friendId : friendship.userId;
          } else {
            actualFriendId = friendship.friendId;
          }
        }

        console.log("Friendship ID:", friendship.id);
        console.log("Friend User ID from params:", friendUserIdParam);
        console.log("Determined friend ID:", actualFriendId);

        setFriendUserId(actualFriendId);

        const stats = await getDailyStatistics(undefined, actualFriendId);
        console.log("Friend stats received:", stats.length);

        const userData = stats[0] || { username: username as string, level: 1, xp: 0 };

        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');

        const todayStats = stats.find(stat =>
          format(new Date(stat.date), 'yyyy-MM-dd') === todayStr
        );
        const todayFocusTime = todayStats?.totalFocusTime || 0;

        // Get start of current week (Monday)
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekStartStr = format(weekStart, 'yyyy-MM-dd');

        console.log("Today:", todayStr);
        console.log("Week start:", weekStartStr);

        const weekStats = stats.filter(stat => {
          const statDateStr = format(new Date(stat.date), 'yyyy-MM-dd');
          return statDateStr >= weekStartStr && statDateStr <= todayStr;
        });

        console.log("Week stats found:", weekStats.length, weekStats);
        const weekFocusTime = weekStats.reduce((acc, curr) => acc + curr.totalFocusTime, 0);

        const allTimeFocusTime = stats.reduce((acc, curr) => acc + curr.totalFocusTime, 0);

        // Build weekly chart data (last 7 days)
        const labels: string[] = [];
        const friendWeekData: number[] = [];
        const myWeekData: number[] = [];

        console.log("Building chart data...");
        console.log("Friend stats count:", stats.length);
        console.log("My stats count:", myStats.length);

        for (let i = 6; i >= 0; i--) {
          const date = subDays(today, i);
          const dateStr = format(date, 'yyyy-MM-dd');
          labels.push(format(date, 'EEE'));

          // Match by comparing just the date portion
          const friendDayStats = stats.find(s => {
            const statDate = format(new Date(s.date), 'yyyy-MM-dd');
            return statDate === dateStr;
          });
          friendWeekData.push(friendDayStats?.totalFocusTime || 0);

          const myDayStats = myStats.find(s => {
            const statDate = format(new Date(s.date), 'yyyy-MM-dd');
            return statDate === dateStr;
          });
          myWeekData.push(myDayStats?.totalFocusTime || 0);
        }

        console.log("Friend week data:", friendWeekData);
        console.log("My week data:", myWeekData);
        console.log("Labels:", labels);

        setWeekLabels(labels);
        setWeeklyFriendData(friendWeekData);
        setWeeklyMyData(myWeekData);

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

        // Check if friend is currently focusing
        try {
          const activeSessions = await getActiveFriendSessions();
          const isFocusing = activeSessions.some(s => s.userId === actualFriendId);
          setIsCurrentlyFocusing(isFocusing);
        } catch (e) {
          console.error("Error checking focus status:", e);
        }
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
  }, [id, username, friendUserIdParam]);

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
                <View style={{ position: "relative" }}>
                  <View
                    style={{
                      height: 64,
                      width: 64,
                      borderRadius: 32,
                      backgroundColor: colors.cool,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: isCurrentlyFocusing ? 3 : 0,
                      borderColor: colors.warm,
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>
                      {user?.username
                        ? user.username.charAt(0).toUpperCase()
                        : "U"}
                    </Text>
                  </View>
                  {/* Live status indicator */}
                  {isCurrentlyFocusing && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: colors.warm,
                        borderWidth: 2,
                        borderColor: colors.surface,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: colors.text,
                        }}
                      />
                    </View>
                  )}
                </View>
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
                    {user?.username || "Loading..."}
                  </Text>
                  {isCurrentlyFocusing && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: colors.warm,
                          marginRight: 6,
                        }}
                      />
                      <Text style={{ color: colors.warm, fontSize: 12, fontWeight: "500" }}>
                        Currently Focusing
                      </Text>
                    </View>
                  )}
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

          {/* Comparison Chart */}
          {weeklyFriendData.length > 0 && user && (
            <ComparisonChart
              myData={weeklyMyData}
              friendData={weeklyFriendData}
              labels={weekLabels}
              friendUsername={user.username}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FriendProfile;
