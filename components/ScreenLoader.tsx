import React from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ScreenLoader = () => (
  <SafeAreaView className="flex-1 bg-black items-center justify-center">
    <ActivityIndicator size="large" color="#FFD700" />
  </SafeAreaView>
);

export default ScreenLoader;
