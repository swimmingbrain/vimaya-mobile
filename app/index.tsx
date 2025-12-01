import { View, ScrollView } from "react-native";
import React from "react";
import Header from "@/components/Header";
import TimeblockList from "@/components/TimeblockList";
import FocusModeButton from "@/components/FocusModeButton";
import CurrentFocusTime from "@/components/CurrentFocusTime";
import TaskList from "@/components/TaskList";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="bg-black h-full py-8">
      <ScrollView>
        <View className="flex gap-10 px-4 py-4">
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
