import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native";
import { colors } from "@/utils/theme";
import { getActiveFriendSessions, ActiveFriendSession, focusSessionPoller } from "@/services/focusSession";
import { useRouter } from "expo-router";

interface LiveFriendAvatarProps {
  friend: ActiveFriendSession;
  onPress: () => void;
}

const LiveFriendAvatar = ({ friend, onPress }: LiveFriendAvatarProps) => {
  const [elapsedTime, setElapsedTime] = useState(friend.currentDurationSeconds);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Update timer
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={{ alignItems: "center", marginRight: 16 }}>
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: colors.cool,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 3,
              borderColor: colors.warm,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>
              {friend.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        </Animated.View>

        {/* Live indicator */}
        <View
          style={{
            position: "absolute",
            top: -2,
            right: 10,
            backgroundColor: colors.warm,
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.bg,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 8, fontWeight: "700" }}>LIVE</Text>
        </View>

        <Text
          style={{
            color: colors.text,
            fontSize: 11,
            fontWeight: "500",
            marginTop: 6,
            maxWidth: 56,
          }}
          numberOfLines={1}
        >
          {friend.username}
        </Text>
        <Text style={{ color: colors.warm, fontSize: 10 }}>{formatTime(elapsedTime)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const LiveFriendsBar = () => {
  const [liveFriends, setLiveFriends] = useState<ActiveFriendSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadLiveFriends = async () => {
      try {
        const sessions = await focusSessionPoller.initializeSessions();
        setLiveFriends(sessions);
      } catch (error) {
        console.error("Error loading live friends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLiveFriends();

    // Start polling
    focusSessionPoller.startPolling(5000);

    const unsubJoin = focusSessionPoller.onFriendJoined((session) => {
      setLiveFriends((prev) => {
        if (prev.some((f) => f.userId === session.userId)) return prev;
        return [...prev, session];
      });
    });

    const unsubLeave = focusSessionPoller.onFriendLeft(({ userId }) => {
      setLiveFriends((prev) => prev.filter((f) => f.userId !== userId));
    });

    return () => {
      focusSessionPoller.stopPolling();
      unsubJoin();
      unsubLeave();
    };
  }, []);

  if (isLoading || liveFriends.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.surface2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.warm,
            marginRight: 8,
          }}
        />
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
          Friends Focusing Now
        </Text>
        <View
          style={{
            backgroundColor: colors.warm + "30",
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 10,
            marginLeft: 8,
          }}
        >
          <Text style={{ color: colors.warm, fontSize: 11, fontWeight: "600" }}>
            {liveFriends.length}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 8 }}
      >
        {liveFriends.map((friend) => (
          <LiveFriendAvatar
            key={friend.userId}
            friend={friend}
            onPress={() => {
              router.push({
                pathname: "/friend/[id]",
                params: { id: friend.userId, friendUserId: friend.userId, username: friend.username },
              });
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default LiveFriendsBar;
