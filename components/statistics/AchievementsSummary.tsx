import React from "react";
import { Text, View } from "react-native";
import { colors } from "@/utils/theme";

interface AchievementsSummaryProps {
  longestSession: number;
  daysWithFocus: number;
  formatTime: (seconds: number) => string;
}

const AchievementsSummary = ({ longestSession, daysWithFocus, formatTime }: AchievementsSummaryProps) => (
  <View style={{
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surface2,
  }}>
    <Text style={{ color: colors.text, fontSize: 17, fontWeight: "600", marginBottom: 16 }}>
      Achievements
    </Text>
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: colors.muted, fontSize: 15 }}>Longest Focus Session</Text>
        <View style={{ backgroundColor: colors.warm + "30", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
          <Text style={{ color: colors.warm, fontSize: 14, fontWeight: "600" }}>{formatTime(longestSession)}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: colors.muted, fontSize: 15 }}>Days in Focus</Text>
        <View style={{ backgroundColor: colors.cool + "30", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
          <Text style={{ color: colors.cool, fontSize: 14, fontWeight: "600" }}>{daysWithFocus} day(s)</Text>
        </View>
      </View>
    </View>
  </View>
);

export default AchievementsSummary;
