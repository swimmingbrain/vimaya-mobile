import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  createTimeBlock,
  deleteTimeBlock,
  getTimeBlocks,
  updateTimeBlock,
} from "@/services/TimeblockService";
import { TimeBlock } from "@/types/types";
import TimeblockDialog from "./TimeblockDialog";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/utils/theme";

const TimeblockList = () => {
  const { isAuthenticated } = useAuth();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingTimeBlock, setEditingTimeBlock] = useState<TimeBlock | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setTimeBlocks([]);
      setLoading(false);
      return;
    }
    fetchTimeBlocks();
  }, [isAuthenticated]);

  const fetchTimeBlocks = async () => {
    setLoading(true);
    try {
      const data = await getTimeBlocks();
      const sortedData = data.sort(
        (a: TimeBlock, b: TimeBlock) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setTimeBlocks(sortedData);
      setError(null);
    } catch (err) {
      console.log(err);
      setError(err instanceof Error ? err.message : "Failed to fetch time blocks.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTimeblock = async (timeblock: TimeBlock) => {
    if (editingTimeBlock) {
      setTimeBlocks((prevBlocks) =>
        prevBlocks
          .map((block) =>
            block.id === editingTimeBlock.id ? { ...block, ...timeblock } : block
          )
          .sort((a, b) => sortByDateAndTime(a, b))
      );
      try {
        await updateTimeBlock(timeblock);
      } catch (ex) {
        console.log(ex);
      }
      setEditingTimeBlock(null);
    } else {
      const newTimeBlock = { ...timeblock, tasks: [] };
      const dbTimeblock = await createTimeBlock(newTimeBlock);
      setTimeBlocks((prevBlocks) =>
        [...prevBlocks, dbTimeblock].sort((a, b) => sortByDateAndTime(a, b))
      );
    }
    setDialogVisible(false);
  };

  const sortByDateAndTime = (a: TimeBlock, b: TimeBlock) => {
    const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    const [aStartHour, aStartMin] = a.startTime.split(":").map(Number);
    const [bStartHour, bStartMin] = b.startTime.split(":").map(Number);
    if (aStartHour !== bStartHour) return aStartHour - bStartHour;
    return aStartMin - bStartMin;
  };

  const confirmDeleteTimeBlock = async (id: string, title: string) => {
    Alert.alert("Delete Activity", "Delete \"" + title + "\" permanently?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => handleDeleteTimeBlock(id), style: "destructive" },
    ]);
  };

  const handleDeleteTimeBlock = async (id: string) => {
    setTimeBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
    try {
      await deleteTimeBlock(id);
    } catch (ex) {
      console.log(ex);
    }
  };

  const navigateToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const navigateToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const formatSelectedDate = () => {
    const today = new Date();
    if (selectedDate.toDateString() === today.toDateString()) {
      return "Today";
    }
    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
    return selectedDate.toLocaleDateString("en-US", options);
  };

  const getTimeBlocksForSelectedDate = () => {
    const selectedDateString = selectedDate.toISOString().split("T")[0];
    const filteredBlocks = timeBlocks.filter((block) => block.date.startsWith(selectedDateString));
    return filteredBlocks.sort((a, b) => {
      const [aStartHour, aStartMin] = a.startTime.split(":").map(Number);
      const [bStartHour, bStartMin] = b.startTime.split(":").map(Number);
      if (aStartHour !== bStartHour) return aStartHour - bStartHour;
      return aStartMin - bStartMin;
    });
  };

  if (loading) {
    return (
      <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 24 }}>
        <ActivityIndicator color={colors.muted} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ backgroundColor: colors.error + "20", padding: 16, borderRadius: 12 }}>
        <Text style={{ color: colors.error }}>{error}</Text>
      </View>
    );
  }

  const timeBlocksForToday = getTimeBlocksForSelectedDate();

  return (
    <View style={{ gap: 12 }}>
      {/* Section Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>Schedule</Text>
        <TouchableOpacity
          onPress={() => { setEditingTimeBlock(null); setDialogVisible(true); }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: colors.cool,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Ionicons name="add" color={colors.text} size={18} />
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: "500" }}>Add Activity</Text>
        </TouchableOpacity>
      </View>

      {/* Date Navigation */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <TouchableOpacity
          onPress={navigateToPreviousDay}
          style={{ backgroundColor: colors.surface, padding: 8, borderRadius: 8 }}
        >
          <Ionicons name="chevron-back" color={colors.muted} size={18} />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: "center", color: colors.text, fontSize: 16, fontWeight: "500" }}>
          {formatSelectedDate()}
        </Text>
        <TouchableOpacity
          onPress={navigateToNextDay}
          style={{ backgroundColor: colors.surface, padding: 8, borderRadius: 8 }}
        >
          <Ionicons name="chevron-forward" color={colors.muted} size={18} />
        </TouchableOpacity>
      </View>

      {timeBlocksForToday.length === 0 ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingVertical: 20,
            paddingHorizontal: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.surface2,
          }}
        >
          <Text style={{ color: colors.muted }}>Nothing planned yet...</Text>
        </View>
      ) : (
        <ScrollView>
          {timeBlocksForToday.map((timeBlock) => (
            <View
              key={timeBlock.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
                marginBottom: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.surface2,
                borderLeftWidth: 3,
                borderLeftColor: timeBlock.isFocus ? colors.warm : colors.cool,
              }}
            >
              <TouchableOpacity
                onPress={() => { setEditingTimeBlock(timeBlock); setDialogVisible(true); }}
                style={{ flex: 1 }}
              >
                <Text style={{ color: colors.text, fontWeight: "500", fontSize: 15 }}>
                  {timeBlock.title}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
                  {timeBlock.startTime} - {timeBlock.endTime}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => timeBlock.id && confirmDeleteTimeBlock(timeBlock.id, timeBlock.title)}
                style={{ padding: 8 }}
              >
                <Ionicons name="trash-outline" color={colors.muted} size={18} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <TimeblockDialog
        visible={dialogVisible}
        onClose={() => { setDialogVisible(false); setEditingTimeBlock(null); }}
        onSave={handleSaveTimeblock}
        timeBlock={editingTimeBlock}
      />
    </View>
  );
};

export default TimeblockList;
