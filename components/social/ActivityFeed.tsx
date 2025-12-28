import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { colors } from "@/utils/theme";
import { getActivityFeed, ActivityFeedItem } from "@/services/focusSession";
import { formatDistanceToNow } from "date-fns";

const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivities = async () => {
    try {
      const data = await getActivityFeed(20);
      setActivities(data);
    } catch (error) {
      console.error("Error loading activity feed:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivities();
    // Refresh every 30 seconds
    const interval = setInterval(loadActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadActivities();
  };

  const getActivityIcon = (type: string) => {
    // Returns null - we'll use colored dots instead of emojis
    return null;
  };

  const getActivityText = (activity: ActivityFeedItem) => {
    switch (activity.type) {
      case "focus_started":
        return `${activity.username} started focusing`;
      case "focus_ended":
        const mins = Math.floor((activity.durationSeconds || 0) / 60);
        return `${activity.username} focused for ${mins} minutes`;
      case "level_up":
        return `${activity.username} reached Level ${activity.newLevel}`;
      default:
        return activity.username;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "focus_started":
        return colors.warm;
      case "focus_ended":
        return colors.cool;
      case "level_up":
        return colors.success;
      default:
        return colors.muted;
    }
  };

  if (isLoading) {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <ActivityIndicator color={colors.warm} />
      </View>
    );
  }

  if (activities.length === 0) {
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
          No recent activity from your friends.{"\n"}Start focusing to inspire others!
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
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.surface2 }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>
          Friend Activity
        </Text>
      </View>

      <ScrollView
        style={{ maxHeight: 300 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.warm} />
        }
      >
        {activities.map((activity, index) => (
          <View
            key={`${activity.userId}-${activity.timestamp}-${index}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 14,
              borderBottomWidth: index < activities.length - 1 ? 1 : 0,
              borderBottomColor: colors.surface2,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: getActivityColor(activity.type) + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: getActivityColor(activity.type),
                }}
              />
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {getActivityText(activity)}
              </Text>
              {activity.message && (
                <Text
                  style={{ color: colors.muted, fontSize: 12, marginTop: 2, fontStyle: "italic" }}
                >
                  "{activity.message}"
                </Text>
              )}
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </Text>
            </View>

            {/* Indicator dot */}
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: getActivityColor(activity.type),
              }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ActivityFeed;
