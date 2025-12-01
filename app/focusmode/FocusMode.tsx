import {
  View,
  Text,
  TouchableOpacity,
  AppState,
  Platform,
  Alert,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { updateXP } from "@/services/profile";
import { updateDailyStatistics } from "@/services/statistics";
import type { AppStateStatus } from "react-native";

const FOCUS_MODE_SCREEN_LOCK_THRESHOLD_MS = 100; // Treat very fast inactive -> background as screen lock

const FocusMode = () => {
  const [timer, setTimer] = useState(0);
  const [xp, setXp] = useState(0);
  const [isGivingUp, setIsGivingUp] = useState(false);
  const [isRunning, setIsRunning] = useState(true); // Internal component flag for starting/stopping based on AppState
  const [currentAppState, setCurrentAppState] = useState<AppStateStatus>(
    AppState.currentState
  );

  const timerIntervalRef = useRef<number | null>(null);
  const xpIntervalRef = useRef<number | null>(null);
  const inactiveTimestamp = useRef<number | null>(null); // To store timestamp when app goes inactive
  const backgroundStartTimestamp = useRef<number | null>(null); // When background begins
  const accumulateWhileBackground = useRef<boolean>(false); // Whether to add elapsed time on resume

  const router = useRouter();

  // --- AppState Handling ---
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Initial check for the current app state to set things up correctly on mount
    // This is important if the component mounts while the app is already in a specific state
    handleAppStateChange(AppState.currentState);

    return () => {
      subscription.remove();
      // Ensure intervals are cleared if component unmounts unexpectedly
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (xpIntervalRef.current) clearInterval(xpIntervalRef.current);
    };
  }, []); // Empty dependency array means this runs once on mount and unmount

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    setCurrentAppState(nextAppState);
    console.log("App State changed to:", nextAppState);

    if (Platform.OS === "ios") {
      if (nextAppState === "inactive") {
        // App is inactive (e.g., screen lock, incoming call, multitasking view)
        // Store the timestamp to measure transition time later
        inactiveTimestamp.current = Date.now();
        // Keep timer running while inactive on iOS
        setIsRunning(true);
      } else if (nextAppState === "background") {
        // App has moved to the background (e.g., user pressed home button, or screen was locked)
        const transitionDuration = inactiveTimestamp.current
          ? Date.now() - inactiveTimestamp.current
          : -1;
        inactiveTimestamp.current = null; // Reset timestamp
        backgroundStartTimestamp.current = Date.now();

        console.log(
          `iOS: App went background. Transition duration from inactive: ${transitionDuration}ms`
        );

        if (
          transitionDuration !== -1 &&
          transitionDuration <= FOCUS_MODE_SCREEN_LOCK_THRESHOLD_MS
        ) {
          // Screen locked detected — keep running and compensate on resume
          console.log(
            "iOS: Detected screen lock (fast inactive -> background)."
          );
          accumulateWhileBackground.current = true;
          setIsRunning(true);
        } else {
          // Genuine backgrounding — pause
          accumulateWhileBackground.current = false;
          setIsRunning(false);
        }
      } else if (nextAppState === "active") {
        // App is back in foreground
        // If we were accumulating while background (screen lock), add elapsed time
        if (accumulateWhileBackground.current && backgroundStartTimestamp.current) {
          const elapsedSec = Math.max(
            0,
            Math.floor((Date.now() - backgroundStartTimestamp.current) / 1000)
          );
          if (elapsedSec > 0) {
            setTimer((prev) => prev + elapsedSec);
            setXp((prevXp) => prevXp + elapsedSec * 50);
          }
        }
        accumulateWhileBackground.current = false;
        backgroundStartTimestamp.current = null;
        inactiveTimestamp.current = null; // Ensure timestamp is clear
        setIsRunning(true);
      }
    } else {
      // Android
      // On Android, 'background' covers both minimize and screen lock.
      // The timer and XP gain should only run if 'active' (app in foreground).
      // It should stop if 'background' (user left app or screen locked).
      setIsRunning(nextAppState === "active");
      console.log(
        "Android: Timer/XP running status set to:",
        nextAppState === "active"
      );
    }
  };

  // --- Timer and XP Interval Control ---
  // This effect will now depend on the combined 'isRunning' state
  useEffect(() => {
    // Clear any existing intervals first to prevent multiple intervals running
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (xpIntervalRef.current) {
      clearInterval(xpIntervalRef.current);
      xpIntervalRef.current = null;
    }

    if (isRunning) {
      console.log("Starting timer and XP gain intervals...");
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000); // Timer updates every second

      xpIntervalRef.current = setInterval(() => {
        setXp((prevXp) => prevXp + 50); // XP gain updates every second
      }, 1000);
    } else {
      console.log("Pausing timer and XP gain intervals...");
    }

    // Cleanup function for when the component unmounts or isRunning changes
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (xpIntervalRef.current) {
        clearInterval(xpIntervalRef.current);
      }
    };
  }, [isRunning]); // This effect runs whenever 'isRunning' changes

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePress = async () => {
    if (isGivingUp) {
      return; // Prevent multiple calls while processing
    }

    setIsGivingUp(true);
    setIsRunning(false); // Stop the timer and XP gain immediately

    try {
      // Update XP
      if (xp > 0) {
        const response = await updateXP(xp);
        console.log("XP updated successfully:", response);
      }

      // Update daily statistics
      await updateDailyStatistics({
        id: 0, // This will be ignored by the backend
        userId: "", // This will be set by the backend
        date: new Date().toISOString(),
        totalFocusTime: timer,
      });

      router.push("/");
    } catch (error: any) {
      console.error("Failed to update data:", error.message);
      Alert.alert("Error", "Failed to save data. Please try again.");
    } finally {
      setIsGivingUp(false);
    }
  };

  return (
    <SafeAreaView className="bg-black">
      <View className="flex items-center justify-center w-full h-full gap-10">
        <View className="flex items-center gap-6">
          <View className="bg-primary w-48 h-48 rounded-full flex items-center justify-center">
            <Text className="text-secondary text-4xl">{formatTime(timer)}</Text>
          </View>
          <Text className="text-secondary">{xp} XP earned</Text>
        </View>
        <TouchableOpacity
          onPress={handlePress}
          disabled={isGivingUp}
          className="flex flex-row items-center bg-secondary rounded-lg py-4 px-20"
        >
          <Text className="text-primary text-lg">give up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FocusMode;
