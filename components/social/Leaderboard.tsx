import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { colors } from "@/utils/theme";
import { getWeeklyLeaderboard, LeaderboardEntry } from "@/services/focusSession";
import { useRouter } from "expo-router";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await getWeeklyLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return { backgroundColor: "#FFD700", color: "#000" }; // Gold
      case 2:
        return { backgroundColor: "#C0C0C0", color: "#000" }; // Silver
      case 3:
        return { backgroundColor: "#CD7F32", color: "#fff" }; // Bronze
      default:
        return { backgroundColor: colors.surface2, color: colors.text };
    }
  };

  if (isLoading) {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <ActivityIndicator color={colors.warm} />
      </View>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          padding: 20,
          borderRadius: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.muted, textAlign: "center" }}>
          No leaderboard data available.{"\n"}Add friends to compete!
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.surface2,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.surface2,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>
          Weekly Leaderboard
        </Text>
        <View
          style={{
            backgroundColor: colors.warm + "30",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: colors.warm, fontSize: 11, fontWeight: "500" }}>
            This Week
          </Text>
        </View>
      </View>

      {leaderboard.slice(0, 10).map((entry, index) => {
        const rankStyle = getRankStyle(entry.rank);
        const isMe = entry.isCurrentUser;

        return (
          <TouchableOpacity
            key={entry.userId}
            onPress={() => {
              if (!isMe) {
                router.push({
                  pathname: "/friend/[id]",
                  params: { id: entry.userId, friendUserId: entry.userId, username: entry.username },
                });
              }
            }}
            activeOpacity={isMe ? 1 : 0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 14,
              borderBottomWidth: index < Math.min(leaderboard.length, 10) - 1 ? 1 : 0,
              borderBottomColor: colors.surface2,
              backgroundColor: isMe ? colors.warm + "15" : "transparent",
            }}
          >
            {/* Rank Badge */}
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: rankStyle.backgroundColor,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text
                style={{
                  color: rankStyle.color,
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {entry.rank}
              </Text>
            </View>

            {/* Avatar */}
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isMe ? colors.warm : colors.cool,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
                borderWidth: isMe ? 2 : 0,
                borderColor: colors.warm,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: "700" }}>
                {entry.username.charAt(0).toUpperCase()}
              </Text>
            </View>

            {/* User Info */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: isMe ? "700" : "500",
                  }}
                >
                  {entry.username}
                </Text>
                {isMe && (
                  <View
                    style={{
                      backgroundColor: colors.warm,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 9, fontWeight: "600" }}>
                      YOU
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                Level {entry.level}
              </Text>
            </View>

            {/* Focus Time */}
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: isMe ? colors.warm : colors.cool,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                {formatTime(entry.totalFocusTimeSeconds)}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 10 }}>focus time</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default Leaderboard;
