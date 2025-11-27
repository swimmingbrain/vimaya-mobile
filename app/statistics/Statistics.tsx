import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import ScreenLoader from "@/components/ScreenLoader";
import AchievementsSummary from "@/components/statistics/AchievementsSummary";
import FocusSummary from "@/components/statistics/FocusSummary";
import WeekNavigator from "@/components/statistics/WeekNavigator";
import WeeklyOverviewChart from "@/components/statistics/WeeklyOverviewChart";
import { useStatisticsScreen } from "@/hooks/statistics/useStatisticsScreen";
import { formatFocusTime } from "@/utils/time";

const Statistics = () => {
  const {
    loading,
    chartData,
    navigateWeek,
    weekRange,
    todayFocusTime,
    currentWeekFocusTime,
    longestFocusSession,
    daysWithFocus,
  } = useStatisticsScreen();

  if (loading) {
    return <ScreenLoader />;
  }

  return (
    <SafeAreaView className="bg-black h-full py-8">
      <ScrollView>
        <View className="flex gap-10 px-4 py-4">
          <Header title="Statistics" icon="arrow-back" />
          <WeekNavigator range={weekRange} onNavigate={navigateWeek} />
          <WeeklyOverviewChart chartData={chartData} />
          <FocusSummary
            today={todayFocusTime}
            currentWeek={currentWeekFocusTime}
            formatTime={formatFocusTime}
          />
          <AchievementsSummary
            longestSession={longestFocusSession}
            daysWithFocus={daysWithFocus}
            formatTime={formatFocusTime}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Statistics;
