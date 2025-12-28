import React from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/utils/theme";

const ScreenLoader = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
    <ActivityIndicator size="large" color={colors.warm} />
  </SafeAreaView>
);

export default ScreenLoader;
