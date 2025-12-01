import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { getDailyStatistics } from "@/services/statistics";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFriends } from "@/services/friendship";

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
        // First, get the friends list to find the correct friend ID
        const friends = await getFriends();
        
        // Find the friendship where either the user is the friend or the friend is the user
        const friendship = friends.find(f => 
          f.id === Number(id) || 
          (f.userId === id || f.friendId === id)
        );
        
        if (!friendship) {
          throw new Error("Friendship not found");
        }

        // Try both IDs from the friendship relationship
        let stats: any[] = [];
        
        // First try with friendId
        console.log('Trying with friendId:', friendship.friendId);
        stats = await getDailyStatistics(undefined, friendship.friendId);
        
        // If no stats found, try with userId
        if (stats.length === 0) {
          console.log('No stats found with friendId, trying with userId:', friendship.userId);
          stats = await getDailyStatistics(undefined, friendship.userId);
        }
        
        // Get the user data from the first stats entry (they all contain the same user info)
        const userData = stats[0] || { username: username as string, level: 1, xp: 0 };
        
        // Calculate today's focus time
        const today = new Date();
        const todayStats = stats.find(stat => 
          new Date(stat.date).toDateString() === today.toDateString()
        );
        const todayFocusTime = todayStats?.totalFocusTime || 0;

        // Calculate this week's focus time
        const weekStart = new Date();
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Start from Monday
        const weekStats = stats.filter(stat => 
          new Date(stat.date) >= weekStart && new Date(stat.date) <= today
        );
        const weekFocusTime = weekStats.reduce((acc, curr) => acc + curr.totalFocusTime, 0);

        // Calculate all-time focus time
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
          completedTasks: 0 // This will be implemented when tasks are completed
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
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <ActivityIndicator size="large" color="#FFD700" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <Text className="text-red-500">{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="bg-black">
        <View className="flex gap-10 px-4 py-4">
          <Header title="Friend Profile" icon="arrow-back" />

          {/* Profile Section */}
          <View className="bg-secondary/10 p-4 rounded-lg">
            <View className="flex-row justify-between">
              <View className="flex-row items-center">
                <View className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                  <Text className="text-primary text-2xl font-bold">
                    {user?.username
                      ? user.username.charAt(0).toUpperCase()
                      : "U"}
                  </Text>
                </View>
                <View className="ml-4">
                  <Text className="text-secondary text-xl font-bold">
                    {user?.username || "Loading..."}
                  </Text>
                </View>
              </View>
              {/* Display Level and XP */}
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

          {/* Statistics Section */}
          <View className="bg-secondary/10 p-4 rounded-lg">
            <Text className="text-secondary text-xl font-bold mb-4">
              Focus Statistics
            </Text>
            <View className="flex-row flex-wrap justify-between">
              <View className="w-[48%] bg-primary/10 p-4 rounded-lg mb-4">
                <Text className="text-secondary/70 text-sm">
                  {"Today's Focus Time"}
                </Text>
                <Text className="text-secondary text-2xl font-bold">
                  {formatTime(statistics.today)}
                </Text>
              </View>
              <View className="w-[48%] bg-primary/10 p-4 rounded-lg mb-4">
                <Text className="text-secondary/70 text-sm">This Week</Text>
                <Text className="text-secondary text-2xl font-bold">
                  {formatTime(statistics.week)}
                </Text>
              </View>
              <View className="w-[48%] bg-primary/10 p-4 rounded-lg mb-4">
                <Text className="text-secondary/70 text-sm">
                  All Time Focus
                </Text>
                <Text className="text-secondary text-2xl font-bold">
                  {formatTime(statistics.allTime)}
                </Text>
              </View>
              <View className="w-[48%] bg-primary/10 p-4 rounded-lg mb-4">
                <Text className="text-secondary/70 text-sm">
                  Completed Tasks
                </Text>
                <Text className="text-secondary text-2xl font-bold">
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
