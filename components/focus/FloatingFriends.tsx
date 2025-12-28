import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
} from "react-native";
import { colors } from "@/utils/theme";
import {
  ActiveFriendSession,
  focusSessionPoller,
} from "@/services/focusSession";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FloatingFriendProps {
  friend: ActiveFriendSession;
  index: number;
}

const FloatingFriend = ({ friend, index }: FloatingFriendProps) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Calculate elapsed time from startTime to stay in sync
  const calculateElapsed = () => {
    const startTime = new Date(friend.startTime).getTime();
    return Math.max(0, Math.floor((Date.now() - startTime) / 1000));
  };

  const [elapsedTime, setElapsedTime] = useState(calculateElapsed());

  // Calculate initial position based on index to spread friends around
  const getInitialPosition = () => {
    const positions = [
      { x: 40, y: 120 },
      { x: SCREEN_WIDTH - 100, y: 150 },
      { x: 30, y: SCREEN_HEIGHT - 250 },
      { x: SCREEN_WIDTH - 90, y: SCREEN_HEIGHT - 280 },
      { x: SCREEN_WIDTH / 2 - 30, y: 100 },
      { x: 50, y: SCREEN_HEIGHT / 2 - 50 },
    ];
    return positions[index % positions.length];
  };

  const pos = getInitialPosition();

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.9,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation
    const floatAnimation = () => {
      const randomX = (Math.random() - 0.5) * 20;
      const randomY = (Math.random() - 0.5) * 20;
      const duration = 3000 + Math.random() * 2000;

      Animated.parallel([
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: randomX,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: -randomX,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: randomY,
            duration: duration * 0.8,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -randomY,
            duration: duration * 0.8,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => floatAnimation());
    };

    floatAnimation();

    // Update timer every second - recalculate from startTime to stay in sync
    const timerInterval = setInterval(() => {
      setElapsedTime(calculateElapsed());
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, [friend.startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        transform: [{ translateX }, { translateY }, { scale }],
        opacity,
        zIndex: 10,
      }}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.surface + "E0",
          borderRadius: 16,
          padding: 8,
          borderWidth: 1,
          borderColor: colors.cool + "60",
          shadowColor: colors.cool,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        {/* Avatar */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.cool,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: colors.warm,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
            {friend.username.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Username */}
        <Text
          style={{
            color: colors.text,
            fontSize: 10,
            fontWeight: "600",
            marginTop: 4,
            maxWidth: 60,
          }}
          numberOfLines={1}
        >
          {friend.username}
        </Text>

        {/* Timer */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 2,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.warm,
              marginRight: 4,
            }}
          />
          <Text style={{ color: colors.warm, fontSize: 10, fontWeight: "500" }}>
            {formatTime(elapsedTime)}
          </Text>
        </View>

        {/* Level badge */}
        <View
          style={{
            backgroundColor: colors.warm + "40",
            paddingHorizontal: 6,
            paddingVertical: 1,
            borderRadius: 6,
            marginTop: 2,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 8 }}>
            Lv.{friend.level}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

interface FloatingFriendsProps {
  isActive: boolean;
}

const FloatingFriends = ({ isActive }: FloatingFriendsProps) => {
  const [friends, setFriends] = useState<ActiveFriendSession[]>([]);

  useEffect(() => {
    if (!isActive) return;

    // Initialize with current active friends
    const init = async () => {
      try {
        const sessions = await focusSessionPoller.initializeSessions();
        setFriends(sessions);
      } catch (error) {
        console.error("Error initializing friend sessions:", error);
      }
    };

    init();

    // Start polling for updates
    focusSessionPoller.startPolling(5000);

    // Listen for friend joining
    const unsubJoin = focusSessionPoller.onFriendJoined((session) => {
      setFriends((prev) => {
        if (prev.some((f) => f.userId === session.userId)) return prev;
        return [...prev, session];
      });
    });

    // Listen for friend leaving
    const unsubLeave = focusSessionPoller.onFriendLeft(({ userId }) => {
      setFriends((prev) => prev.filter((f) => f.userId !== userId));
    });

    return () => {
      focusSessionPoller.stopPolling();
      unsubJoin();
      unsubLeave();
    };
  }, [isActive]);

  if (!isActive || friends.length === 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "box-none",
      }}
    >
      {friends.map((friend, index) => (
        <FloatingFriend
          key={friend.userId}
          friend={friend}
          index={index}
        />
      ))}
    </View>
  );
};

export default FloatingFriends;
