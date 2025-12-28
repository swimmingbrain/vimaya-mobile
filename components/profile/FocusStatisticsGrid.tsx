import React from "react";
import { Text, View } from "react-native";
import { FocusStatistics } from "@/hooks/profile/useProfileScreen";
import { formatFocusTime } from "@/utils/time";
import { colors } from "@/utils/theme";

interface FocusStatisticsGridProps {
  stats: FocusStatistics;
}

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <View style={{
    width: "48%",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.surface2,
  }}>
    <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 6 }}>{label}</Text>
    <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>{value}</Text>
  </View>
);

const FocusStatisticsGrid = ({ stats }: FocusStatisticsGridProps) => (
  <View>
    <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
      Focus Statistics
    </Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
      <StatCard label="Today's Focus" value={formatFocusTime(stats.today)} />
      <StatCard label="This Week" value={formatFocusTime(stats.week)} />
      <StatCard label="All Time" value={formatFocusTime(stats.allTime)} />
      <StatCard label="Completed Tasks" value={String(stats.completedTasks)} />
    </View>
  </View>
);

export default FocusStatisticsGrid;
