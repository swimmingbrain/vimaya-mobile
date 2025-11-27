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

const TimeblockList = () => {
  const { isAuthenticated } = useAuth();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingTimeBlock, setEditingTimeBlock] = useState<TimeBlock | null>(
    null
  );

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
      setError(
        err instanceof Error ? err.message : "Failed to fetch time blocks."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTimeblock = async (timeblock: TimeBlock) => {
    if (editingTimeBlock) {
      setTimeBlocks((prevBlocks) =>
        prevBlocks
          .map((block) =>
            block.id === editingTimeBlock.id
              ? { ...block, ...timeblock }
              : block
          )
          .sort((a, b) => sortByDateAndTime(a, b))  
      );

      try {
          console.log(timeblock)
          await updateTimeBlock(timeblock);
      } catch (ex) {
        console.log(ex)
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
    const dateComparison =
      new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    const [aStartHour, aStartMin] = a.startTime.split(":").map(Number);
    const [bStartHour, bStartMin] = b.startTime.split(":").map(Number);
    if (aStartHour !== bStartHour) return aStartHour - bStartHour;
    return aStartMin - bStartMin;
  };

  const confirmDeleteTimeBlock = async (id: string, title: string) => {
    Alert.alert(
      "Delete Activity",
      `Delete "${title}" permanently?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => handleDeleteTimeBlock(id),
          style: "destructive",
        },
      ]
    );
  };

  const handleDeleteTimeBlock = async(id: string) => {
    setTimeBlocks((prevBlocks) =>
      prevBlocks.filter((block) => block.id !== id)
    );

    try
    {
      await deleteTimeBlock(id);
    } catch (ex) {
      console.log(ex)
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
    } else {
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return selectedDate.toLocaleDateString("en-US", options);
    }
  };

  const getTimeBlocksForSelectedDate = () => {
    const selectedDateString = selectedDate.toISOString().split("T")[0];
    const filteredBlocks = timeBlocks.filter(
      (block) => block.date.startsWith(selectedDateString)
    );
    return filteredBlocks.sort((a, b) => {
      const [aStartHour, aStartMin] = a.startTime.split(":").map(Number);
      const [bStartHour, bStartMin] = b.startTime.split(":").map(Number);
      if (aStartHour !== bStartHour) return aStartHour - bStartHour;
      return aStartMin - bStartMin;
    });
  };

  if (loading) {
    return (
      <View className="flex items-center justify-center py-6">
        <ActivityIndicator color="#c1c1c1" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-red-500/20 p-4 rounded-lg">
        <Text className="text-red-400">{error}</Text>
      </View>
    );
  }

  const timeBlocksForToday = getTimeBlocksForSelectedDate();

  return (
    <View className="flex gap-4">
      <View className="flex flex-row gap-2 items-center">
        <TouchableOpacity onPress={navigateToPreviousDay}>
          <Ionicons name="chevron-back" color="#c1c1c1" />
        </TouchableOpacity>
        <Text className="text-xl text-secondary flex-1 text-center">
          {formatSelectedDate()}
        </Text>
        <TouchableOpacity onPress={navigateToNextDay}>
          <Ionicons name="chevron-forward" color="#c1c1c1" />
        </TouchableOpacity>
      </View>

      {timeBlocksForToday.length === 0 ? (
        <TouchableOpacity className="flex flex-row gap-2 items-center bg-primary rounded-lg py-4 px-5">
          <Text className="text-secondary">nothing planned yet ...</Text>
        </TouchableOpacity>
      ) : (
        <ScrollView>
          {timeBlocksForToday.map((timeBlock) => (
            <View
              key={timeBlock.id}
              className="bg-primary rounded-lg py-4 px-5 mb-2 flex-row justify-between items-center"
            >
              <TouchableOpacity
                onPress={() => {
                  setEditingTimeBlock(timeBlock);
                  setDialogVisible(true);
                }}
                className="flex-1"
              >
                <View>
                  <Text className="text-secondary font-medium">
                    {timeBlock.title}
                  </Text>
                  <Text className="text-secondary text-sm">
                    {timeBlock.startTime} - {timeBlock.endTime}
                  </Text>
                  <Text className="text-secondary text-xs mt-1">
                    {timeBlock.isFocus ? "Focus" : "Leisure"}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  timeBlock.id &&
              confirmDeleteTimeBlock(timeBlock.id, timeBlock.title)
            }
            className="p-2"
          >
            <Ionicons name="trash-outline" color="#c1c1c1" size={20} />
          </TouchableOpacity>
        </View>
      ))}
        </ScrollView>
      )}

      <TouchableOpacity
        className="flex flex-row items-center justify-end gap-2"
        onPress={() => {
      setEditingTimeBlock(null);
      setDialogVisible(true);
    }}
  >
    <Ionicons name="add" color="#c1c1c1" size={20} />
    <Text className="text-secondary">Add Activity</Text>
  </TouchableOpacity>

      <TimeblockDialog
        visible={dialogVisible}
        onClose={() => {
          setDialogVisible(false);
          setEditingTimeBlock(null);
        }}
        onSave={handleSaveTimeblock}
        timeBlock={editingTimeBlock}
      />
    </View>
  );
};

export default TimeblockList;
