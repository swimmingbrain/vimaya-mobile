import { View, ScrollView } from "react-native";
import React from "react";
import Header from "@/components/Header";
import TimeblockList from "@/components/TimeblockList";
import FocusModeButton from "@/components/FocusModeButton";
import CurrentFocusTime from "@/components/CurrentFocusTime";
import TaskList from "@/components/TaskList";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/utils/theme";

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, paddingVertical: 16 }}>
      <ScrollView>
        <View style={{ gap: 24, paddingHorizontal: 16, paddingVertical: 16 }}>
          <Header title="Dashboard" icon="home-outline" />
          <FocusModeButton />
          <TimeblockList />
          <CurrentFocusTime />
          <TaskList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
