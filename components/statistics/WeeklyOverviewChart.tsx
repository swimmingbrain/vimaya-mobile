import React from "react";
import { Dimensions, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import type { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";

interface WeeklyOverviewChartProps {
  chartData: LineChartData;
}

const WeeklyOverviewChart = ({ chartData }: WeeklyOverviewChartProps) => (
  <View className="bg-secondary/10 p-4 rounded-lg">
    <Text className="text-secondary text-lg mb-4">Weekly Overview</Text>
    <LineChart
      data={chartData}
      width={Dimensions.get("window").width - 48}
      height={220}
      chartConfig={{
        backgroundColor: "#000000",
        backgroundGradientFrom: "#000000",
        backgroundGradientTo: "#000000",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16,
        },
        propsForDots: {
          r: "6",
          strokeWidth: "2",
          stroke: "#FFD700",
        },
        formatYLabel: (value) => `${Math.round(Number(value))}m`,
        count: 5,
      }}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}
      segments={4}
    />
  </View>
);

export default WeeklyOverviewChart;
