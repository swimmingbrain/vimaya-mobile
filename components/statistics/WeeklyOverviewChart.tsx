import React, { useState } from "react";
import { Dimensions, Text, View, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-chart-kit";
import type { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";
import { colors } from "@/utils/theme";

interface WeeklyOverviewChartProps {
  chartData: LineChartData;
}

interface TooltipData {
  value: number;
  label: string;
  x: number;
  y: number;
}

const WeeklyOverviewChart = ({ chartData }: WeeklyOverviewChartProps) => {
  const [selectedPoint, setSelectedPoint] = useState<TooltipData | null>(null);
  const chartWidth = Dimensions.get("window").width - 64;

  const handleDataPointClick = (data: {
    index: number;
    value: number;
    dataset: { data: number[] };
    x: number;
    y: number;
    getColor: (opacity: number) => string;
  }) => {
    const label = chartData.labels?.[data.index] || "";
    setSelectedPoint({
      value: data.value,
      label: label,
      x: data.x,
      y: data.y,
    });
  };

  const formatMinutes = (mins: number) => {
    const roundedMins = Math.round(mins);
    if (roundedMins >= 60) {
      const hours = Math.floor(roundedMins / 60);
      const remainingMins = roundedMins % 60;
      return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    }
    return `${roundedMins}m`;
  };

  // Calculate average and max for insights
  const dataValues = chartData.datasets?.[0]?.data || [];
  const total = dataValues.reduce((a, b) => a + b, 0);
  const avgValue = dataValues.length > 0 ? Math.round(total / dataValues.length) : 0;
  const maxValue = Math.round(Math.max(...dataValues, 0));
  const maxDayIndex = dataValues.findIndex(v => Math.round(v) === maxValue);
  const maxDay = chartData.labels?.[maxDayIndex] || "";

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.surface2,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>
          Weekly Overview
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.warm, marginRight: 6 }} />
          <Text style={{ color: colors.muted, fontSize: 12 }}>Focus Time</Text>
        </View>
      </View>

      {/* Chart Container */}
      <View style={{ position: "relative" }}>
        {/* Tooltip */}
        {selectedPoint && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSelectedPoint(null)}
            style={{
              position: "absolute",
              left: Math.min(Math.max(selectedPoint.x - 40, 10), chartWidth - 100),
              top: Math.max(selectedPoint.y - 60, 0),
              zIndex: 100,
              backgroundColor: colors.bgAlt,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.warm,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: "600" }}>
              {selectedPoint.label}
            </Text>
            <Text style={{ color: colors.warm, fontSize: 14, fontWeight: "700" }}>
              {formatMinutes(selectedPoint.value)}
            </Text>
          </TouchableOpacity>
        )}

        <LineChart
          data={chartData}
          width={chartWidth}
          height={200}
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.warm,
            labelColor: (opacity = 1) => colors.muted,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: colors.warm,
              fill: colors.surface,
            },
            formatYLabel: (value) => String(Math.round(Number(value))),
            propsForBackgroundLines: {
              stroke: colors.surface2,
              strokeWidth: 1,
              strokeDasharray: "4,4",
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            marginLeft: -16,
          }}
          segments={4}
          withInnerLines={true}
          withOuterLines={false}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          onDataPointClick={handleDataPointClick}
          fromZero
        />
      </View>

      {/* Axis Labels */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingHorizontal: 8 }}>
        <Text style={{ color: colors.muted, fontSize: 10 }}>min</Text>
        <Text style={{ color: colors.muted, fontSize: 10 }}>Day of Week</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Quick Stats */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: colors.surface2,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 4 }}>
            Daily Average
          </Text>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
            {formatMinutes(avgValue)}
          </Text>
        </View>
        <View
          style={{
            width: 1,
            backgroundColor: colors.surface2,
          }}
        />
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 4 }}>
            Best Day
          </Text>
          <Text style={{ color: colors.warm, fontSize: 16, fontWeight: "700" }}>
            {maxDay || "-"}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 10 }}>
            {maxValue > 0 ? formatMinutes(maxValue) : "-"}
          </Text>
        </View>
        <View
          style={{
            width: 1,
            backgroundColor: colors.surface2,
          }}
        />
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 4 }}>
            Total
          </Text>
          <Text style={{ color: colors.cool, fontSize: 16, fontWeight: "700" }}>
            {formatMinutes(total)}
          </Text>
        </View>
      </View>

      {/* Tap hint */}
      <Text style={{ color: colors.muted, fontSize: 10, textAlign: "center", marginTop: 12, fontStyle: "italic" }}>
        Tap on data points for details
      </Text>
    </View>
  );
};

export default WeeklyOverviewChart;
