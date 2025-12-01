import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  WeekDirection,
  WeekRange,
} from "@/hooks/statistics/useStatisticsScreen";

interface WeekNavigatorProps {
  range: WeekRange;
  onNavigate: (direction: WeekDirection) => void;
}

const WeekNavigator = ({ range, onNavigate }: WeekNavigatorProps) => (
  <View className="flex-row justify-between items-center">
    <TouchableOpacity onPress={() => onNavigate("prev")} className="p-2">
      <Ionicons name="chevron-back" color="#FFD700" size={24} />
    </TouchableOpacity>
    <Text className="text-secondary">
      {format(range.start, "dd.MM", { locale: de })} -{" "}
      {format(range.end, "dd.MM", { locale: de })}
    </Text>
    <TouchableOpacity onPress={() => onNavigate("next")} className="p-2">
      <Ionicons name="chevron-forward" color="#FFD700" size={24} />
    </TouchableOpacity>
  </View>
);

export default WeekNavigator;
