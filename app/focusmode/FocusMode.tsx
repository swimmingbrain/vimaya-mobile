import {
  View,
  Text,
  TouchableOpacity,
  AppState,
  Platform,
  Alert,
  Animated,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { updateXP } from "@/services/profile";
import { updateDailyStatistics } from "@/services/statistics";
import { colors } from "@/utils/theme";
import type { AppStateStatus } from "react-native";
import FloatingFriends from "@/components/focus/FloatingFriends";
import {
  startFocusSession,
  endFocusSession,
} from "@/services/focusSession";

const FOCUS_MODE_SCREEN_LOCK_THRESHOLD_MS = 100;

const FocusMode = () => {
  const [timer, setTimer] = useState(0);
  const [xp, setXp] = useState(0);
  const [isGivingUp, setIsGivingUp] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [currentAppState, setCurrentAppState] = useState<AppStateStatus>(
    AppState.currentState
  );
  const [sessionStarted, setSessionStarted] = useState(false);

  const timerIntervalRef = useRef<number | null>(null);
  const xpIntervalRef = useRef<number | null>(null);
  const inactiveTimestamp = useRef<number | null>(null);
  const backgroundStartTimestamp = useRef<number | null>(null);
  const accumulateWhileBackground = useRef<boolean>(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const router = useRouter();

  // Start focus session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        await startFocusSession();
        setSessionStarted(true);
      } catch (error) {
        console.error("Error starting focus session:", error);
      }
    };
    initSession();
  }, []);
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    handleAppStateChange(AppState.currentState);

    return () => {
      subscription.remove();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (xpIntervalRef.current) clearInterval(xpIntervalRef.current);
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    setCurrentAppState(nextAppState);

    if (Platform.OS === "ios") {
      if (nextAppState === "inactive") {
        inactiveTimestamp.current = Date.now();
        setIsRunning(true);
      } else if (nextAppState === "background") {
        const transitionDuration = inactiveTimestamp.current
          ? Date.now() - inactiveTimestamp.current
          : -1;
        inactiveTimestamp.current = null;
        backgroundStartTimestamp.current = Date.now();

        if (transitionDuration !== -1 && transitionDuration <= FOCUS_MODE_SCREEN_LOCK_THRESHOLD_MS) {
          accumulateWhileBackground.current = true;
          setIsRunning(true);
        } else {
          accumulateWhileBackground.current = false;
          setIsRunning(false);
        }
      } else if (nextAppState === "active") {
        if (accumulateWhileBackground.current && backgroundStartTimestamp.current) {
          const elapsedSec = Math.max(0, Math.floor((Date.now() - backgroundStartTimestamp.current) / 1000));
          if (elapsedSec > 0) {
            setTimer((prev) => prev + elapsedSec);
            setXp((prevXp) => prevXp + elapsedSec * 50);
          }
        }
        accumulateWhileBackground.current = false;
        backgroundStartTimestamp.current = null;
        inactiveTimestamp.current = null;
        setIsRunning(true);
      }
    } else {
      setIsRunning(nextAppState === "active");
    }
  };

  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (xpIntervalRef.current) {
      clearInterval(xpIntervalRef.current);
      xpIntervalRef.current = null;
    }

    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);

      xpIntervalRef.current = setInterval(() => {
        setXp((prevXp) => prevXp + 50);
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (xpIntervalRef.current) clearInterval(xpIntervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return hrs + ":" + mins.toString().padStart(2, "0") + ":" + secs.toString().padStart(2, "0");
    }
    return mins.toString().padStart(2, "0") + ":" + secs.toString().padStart(2, "0");
  };

  const formatXP = (value: number) => value >= 1000 ? (value / 1000).toFixed(1) + "k" : value.toString();

  const getStatusText = () => {
    if (timer < 60) return "Just started";
    if (timer < 300) return "Getting focused";
    if (timer < 900) return "Deep focus";
    return "Flow state";
  };

  const progressPercent = Math.min((timer / 3600) * 100, 100);

  const handlePress = async () => {
    if (isGivingUp) return;

    setIsGivingUp(true);
    setIsRunning(false);

    try {
      // End the focus session on the server
      try {
        await endFocusSession(timer);
      } catch (error) {
        console.error("Error ending focus session:", error);
      }

      if (xp > 0) {
        await updateXP(xp);
      }

      await updateDailyStatistics({
        id: 0,
        userId: "",
        date: new Date().toISOString(),
        totalFocusTime: timer,
      });

      router.replace("/" as any);
    } catch (error: any) {
      Alert.alert("Error", "Failed to save data. Please try again.");
    } finally {
      setIsGivingUp(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Floating Friends in Background */}
      <FloatingFriends isActive={sessionStarted} />

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>{getStatusText()}</Text>

        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
            width: 240,
            height: 240,
            borderRadius: 120,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 3,
            borderColor: colors.surface2,
          }}
        >
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: colors.bgAlt,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: colors.warm,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 48, fontWeight: "300", letterSpacing: 2 }}>
              {formatTime(timer)}
            </Text>
          </View>
        </Animated.View>

        <View style={{ marginTop: 32, alignItems: "center", gap: 16 }}>
          <View
            style={{
              backgroundColor: colors.surface,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.cool }} />
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "500" }}>{formatXP(xp)} XP</Text>
          </View>

          <View style={{ width: 200, height: 4, backgroundColor: colors.surface2, borderRadius: 2, marginTop: 8 }}>
            <View
              style={{
                width: progressPercent + "%",
                height: 4,
                backgroundColor: colors.warm,
                borderRadius: 2,
              }}
            />
          </View>
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            {Math.floor(progressPercent)}% of 1 hour goal
          </Text>
        </View>

        <TouchableOpacity
          onPress={handlePress}
          disabled={isGivingUp}
          style={{
            marginTop: 48,
            backgroundColor: colors.surface,
            paddingHorizontal: 40,
            paddingVertical: 16,
            borderRadius: 30,
            borderWidth: 1,
            borderColor: colors.surface2,
            opacity: isGivingUp ? 0.5 : 1,
          }}
        >
          <Text style={{ color: colors.muted, fontSize: 16, fontWeight: "500" }}>End Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FocusMode;
