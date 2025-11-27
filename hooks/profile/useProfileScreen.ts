import { useCallback, useEffect, useState } from "react";
import { endOfWeek, isToday, startOfWeek } from "date-fns";
import { useRouter } from "expo-router";
import { getFriends } from "@/services/friends";
import { getUserProfile } from "@/services/profile";
import {
  DailyStatisticsDTO,
  getDailyStatistics,
} from "@/services/statistics";
import { Friendship, UserProfile } from "@/types/types";
import { useAuth } from "@/contexts/AuthContext";

export interface FocusStatistics {
  today: number;
  week: number;
  allTime: number;
  completedTasks: number;
}

const EMPTY_STATS: FocusStatistics = {
  today: 0,
  week: 0,
  allTime: 0,
  completedTasks: 0,
};

const calculateFocusStatistics = (
  stats: DailyStatisticsDTO[],
): FocusStatistics => {
  if (stats.length === 0) {
    return EMPTY_STATS;
  }

  const todayTotal = stats
    .filter((stat) => isToday(new Date(stat.date)))
    .reduce((sum, stat) => sum + stat.totalFocusTime, 0);

  const currentWeekRange = {
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  };

  const weekTotal = stats
    .filter((stat) => {
      const statDate = new Date(stat.date);
      return (
        statDate >= currentWeekRange.start &&
        statDate <= currentWeekRange.end
      );
    })
    .reduce((sum, stat) => sum + stat.totalFocusTime, 0);

  const allTimeTotal = stats.reduce(
    (sum, stat) => sum + stat.totalFocusTime,
    0,
  );

  return {
    today: todayTotal,
    week: weekTotal,
    allTime: allTimeTotal,
    completedTasks: 0,
  };
};

export const useProfileScreen = () => {
  const router = useRouter();
  const { isAuthenticated, signOut } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [focusStats, setFocusStats] =
    useState<FocusStatistics>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfileAndStats = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setUser(null);
      setFocusStats(EMPTY_STATS);
      return;
    }
    try {
      setLoading(true);
      const [profileResponse, statisticsResponse] = await Promise.all([
        getUserProfile(),
        getDailyStatistics(new Date()),
      ]);
      setUser(profileResponse);
      setFocusStats(calculateFocusStatistics(statisticsResponse));
    } catch (err) {
      console.error("Failed to load profile or statistics:", err);
      setUser(null);
      setFocusStats(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadFriends = useCallback(async () => {
    if (!isAuthenticated) {
      setFriends([]);
      setFriendsLoading(false);
      return;
    }
    try {
      setFriendsLoading(true);
      setError(null);
      const loadedFriends = await getFriends();
      setFriends(loadedFriends);
    } catch (err) {
      console.error("Error loading friends:", err);
      if (err instanceof Error) {
        setError(`Failed to load friends: ${err.message}`);
      } else {
        setError("Failed to load friends: Unknown error");
      }
    } finally {
      setFriendsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfileAndStats();
      loadFriends();
    }
  }, [isAuthenticated, loadFriends, loadProfileAndStats]);

  const logout = useCallback(async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, [router, signOut]);

  return {
    user,
    focusStats,
    friends,
    loading,
    friendsLoading,
    error,
    logout,
    refreshFriends: loadFriends,
  };
};
