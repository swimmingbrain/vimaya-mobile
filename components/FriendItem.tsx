import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { Friendship } from "@/services/friendship";
import { router } from "expo-router";
import { colors } from "@/utils/theme";

interface FriendItemProps {
  friend: Friendship;
  onRemove: (friendshipId: number) => void;
  isLoading: boolean;
  isLive?: boolean;
  focusStartTime?: string;
}

const FriendItem: React.FC<FriendItemProps> = ({
  friend,
  onRemove,
  isLoading,
  isLive = false,
  focusStartTime,
}) => {
  // Calculate elapsed time from startTime to stay in sync
  const calculateElapsed = () => {
    if (!focusStartTime) return 0;
    const startTime = new Date(focusStartTime).getTime();
    return Math.max(0, Math.floor((Date.now() - startTime) / 1000));
  };

  const [elapsedTime, setElapsedTime] = useState(calculateElapsed());
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLive && focusStartTime) {
      // Pulse animation for live indicator
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Update timer - recalculate from startTime to stay in sync
      const interval = setInterval(() => {
        setElapsedTime(calculateElapsed());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLive, focusStartTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePress = () => {
    // Use friendship ID for unique identification, pass friendId as param
    router.push({
      pathname: "/friend/[id]",
      params: {
        id: String(friend.id),
        friendUserId: friend.friendId,
        username: friend.friendUsername
      },
    });
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: isLive ? colors.warm + "10" : colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: isLive ? 2 : 1,
        borderColor: isLive ? colors.warm : colors.surface2,
      }}
      onPress={handlePress}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ position: "relative" }}>
            <View
              style={{
                height: 44,
                width: 44,
                borderRadius: 22,
                backgroundColor: colors.cool,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: isLive ? 2 : 0,
                borderColor: colors.warm,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>
                {friend.friendUsername.charAt(0).toUpperCase()}
              </Text>
            </View>
            {/* Live indicator dot */}
            {isLive && (
              <Animated.View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: colors.warm,
                  borderWidth: 2,
                  borderColor: colors.surface,
                  transform: [{ scale: pulseAnim }],
                }}
              />
            )}
          </View>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: colors.text, fontWeight: "500", fontSize: 15 }}>
                {friend.friendUsername}
              </Text>
              {isLive && (
                <View
                  style={{
                    backgroundColor: colors.warm,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    marginLeft: 8,
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 9, fontWeight: "700" }}>
                    LIVE
                  </Text>
                </View>
              )}
            </View>
            {isLive ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.warm,
                    marginRight: 6,
                  }}
                />
                <Text style={{ color: colors.warm, fontSize: 13, fontWeight: "500" }}>
                  Focusing for {formatTime(elapsedTime)}
                </Text>
              </View>
            ) : (
              <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
                Friends since {new Date(friend.createdAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.muted} />
        ) : !isLive ? (
          <TouchableOpacity
            style={{
              backgroundColor: colors.error + "20",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 8,
            }}
            onPress={(e) => {
              e.stopPropagation();
              onRemove(friend.id);
            }}
          >
            <Text style={{ color: colors.error, fontWeight: "500", fontSize: 13 }}>Remove</Text>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              backgroundColor: colors.cool + "30",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: colors.cool, fontSize: 12, fontWeight: "500" }}>View</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default FriendItem;
