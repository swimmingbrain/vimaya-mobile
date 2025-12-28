import React from "react";
import { Text, View } from "react-native";
import { colors } from "@/utils/theme";

interface FocusSummaryProps {
  today: number;
  currentWeek: number;
  formatTime: (seconds: number) => string;
}

const FocusSummary = ({ today, currentWeek, formatTime }: FocusSummaryProps) => (
  <View style={{
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surface2,
  }}>
    <Text style={{ color: colors.text, fontSize: 17, fontWeight: "600", marginBottom: 16 }}>
      Daily Statistics
    </Text>
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: colors.muted, fontSize: 15 }}>Focus time today</Text>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>{formatTime(today)}</Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: colors.muted, fontSize: 15 }}>Focus time this week</Text>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>{formatTime(currentWeek)}</Text>
      </View>
    </View>
  </View>
);

export default FocusSummary;
