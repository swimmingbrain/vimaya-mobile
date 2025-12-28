import React, { useState } from "react";
import { Dimensions, Text, View, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { colors } from "@/utils/theme";

interface ComparisonChartProps {
  myData: number[];
  friendData: number[];
  labels: string[];
  friendUsername: string;
}

interface TooltipData {
  myValue: number;
  friendValue: number;
  label: string;
  x: number;
  y: number;
}

const ComparisonChart = ({
  myData,
  friendData,
  labels,
  friendUsername,
}: ComparisonChartProps) => {
  const [selectedPoint, setSelectedPoint] = useState<TooltipData | null>(null);
  const chartWidth = Dimensions.get("window").width - 48;

  // Convert seconds to minutes for display
  const myDataMinutes = myData.map((seconds) => Math.round(seconds / 60));
  const friendDataMinutes = friendData.map((seconds) => Math.round(seconds / 60));

  // Ensure we have valid data arrays with at least some values
  const safeFriendData = friendDataMinutes.length > 0 && friendDataMinutes.some(v => v > 0)
    ? friendDataMinutes
    : friendDataMinutes.length > 0 ? friendDataMinutes : [0, 0, 0, 0, 0, 0, 0];
  const safeMyData = myDataMinutes.length > 0 && myDataMinutes.some(v => v > 0)
    ? myDataMinutes
    : myDataMinutes.length > 0 ? myDataMinutes : [0, 0, 0, 0, 0, 0, 0];

  const chartData = {
    labels: labels.length > 0 ? labels : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: safeFriendData,
        color: (opacity = 1) => colors.cool,
        strokeWidth: 3,
      },
      {
        data: safeMyData,
        color: (opacity = 1) => `rgba(194, 107, 92, ${opacity * 0.6})`,
        strokeWidth: 2,
      },
    ],
  };

  const handleDataPointClick = (data: {
    index: number;
    value: number;
    dataset: { data: number[] };
    x: number;
    y: number;
    getColor: (opacity: number) => string;
  }) => {
    const label = labels[data.index] || "";
    setSelectedPoint({
      myValue: myDataMinutes[data.index] || 0,
      friendValue: friendDataMinutes[data.index] || 0,
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

  // Calculate totals
  const myTotal = myDataMinutes.reduce((a, b) => a + b, 0);
  const friendTotal = friendDataMinutes.reduce((a, b) => a + b, 0);
  const diff = friendTotal - myTotal;

  // Calculate who is ahead more days
  let myWins = 0;
  let friendWins = 0;
  for (let i = 0; i < labels.length; i++) {
    if (myDataMinutes[i] > friendDataMinutes[i]) myWins++;
    else if (friendDataMinutes[i] > myDataMinutes[i]) friendWins++;
  }

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
      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 12,
        }}
      >
        Weekly Comparison
      </Text>

      {/* Legend */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 24,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 16,
              height: 3,
              backgroundColor: colors.cool,
              marginRight: 8,
              borderRadius: 2,
            }}
          />
          <Text style={{ color: colors.text, fontSize: 12 }}>{friendUsername}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 16,
              height: 3,
              backgroundColor: colors.warm + "99",
              marginRight: 8,
              borderRadius: 2,
            }}
          />
          <Text style={{ color: colors.muted, fontSize: 12 }}>You</Text>
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
              left: Math.min(Math.max(selectedPoint.x - 50, 10), chartWidth - 120),
              top: Math.max(selectedPoint.y - 80, 0),
              zIndex: 100,
              backgroundColor: colors.bgAlt,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.surface2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: "600", marginBottom: 4 }}>
              {selectedPoint.label}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}>
              <View>
                <Text style={{ color: colors.muted, fontSize: 10 }}>{friendUsername}</Text>
                <Text style={{ color: colors.cool, fontSize: 13, fontWeight: "700" }}>
                  {formatMinutes(selectedPoint.friendValue)}
                </Text>
              </View>
              <View>
                <Text style={{ color: colors.muted, fontSize: 10 }}>You</Text>
                <Text style={{ color: colors.warm, fontSize: 13, fontWeight: "700" }}>
                  {formatMinutes(selectedPoint.myValue)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <LineChart
          data={chartData}
          width={chartWidth - 16}
          height={180}
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.cool,
            labelColor: (opacity = 1) => colors.muted,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: colors.cool,
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

      {/* Stats comparison */}
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
            {friendUsername}
          </Text>
          <Text style={{ color: colors.cool, fontSize: 18, fontWeight: "700" }}>
            {formatMinutes(friendTotal)}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>
            {friendWins} days ahead
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
            Difference
          </Text>
          <Text
            style={{
              color: diff > 0 ? colors.cool : diff < 0 ? colors.warm : colors.text,
              fontSize: 18,
              fontWeight: "700",
            }}
          >
            {diff > 0 ? "+" : ""}{formatMinutes(Math.abs(diff))}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>
            {diff > 0 ? `${friendUsername} leads` : diff < 0 ? "You lead" : "Tied"}
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
            You
          </Text>
          <Text style={{ color: colors.warm, fontSize: 18, fontWeight: "700" }}>
            {formatMinutes(myTotal)}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>
            {myWins} days ahead
          </Text>
        </View>
      </View>

      {/* Tap hint */}
      <Text style={{ color: colors.muted, fontSize: 10, textAlign: "center", marginTop: 12, fontStyle: "italic" }}>
        Tap on data points to compare
      </Text>
    </View>
  );
};

export default ComparisonChart;
