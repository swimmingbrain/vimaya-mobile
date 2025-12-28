import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { WeekDirection, WeekRange } from "@/hooks/statistics/useStatisticsScreen";
import { colors } from "@/utils/theme";

interface WeekNavigatorProps {
  range: WeekRange;
  onNavigate: (direction: WeekDirection) => void;
}

const WeekNavigator = ({ range, onNavigate }: WeekNavigatorProps) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
    <TouchableOpacity
      onPress={() => onNavigate("prev")}
      style={{ backgroundColor: colors.surface, padding: 10, borderRadius: 10 }}
    >
      <Ionicons name="chevron-back" color={colors.muted} size={20} />
    </TouchableOpacity>
    <Text style={{ color: colors.text, fontSize: 16, fontWeight: "500" }}>
      {format(range.start, "dd.MM", { locale: de })} - {format(range.end, "dd.MM", { locale: de })}
    </Text>
    <TouchableOpacity
      onPress={() => onNavigate("next")}
      style={{ backgroundColor: colors.surface, padding: 10, borderRadius: 10 }}
    >
      <Ionicons name="chevron-forward" color={colors.muted} size={20} />
    </TouchableOpacity>
  </View>
);

export default WeekNavigator;
