import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TimeBlock } from "@/types/types";

interface TimeblockDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (timeblock: TimeBlock) => void;
  timeBlock?: TimeBlock | null;
}

const TimeblockDialog: React.FC<TimeblockDialogProps> = ({
  visible,
  onClose,
  onSave,
  timeBlock,
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isFocus, setIsFocus] = useState(true);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Time picker states
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState(new Date());

  // Load time block data when editing
  useEffect(() => {
    if (timeBlock) {
      setTitle(timeBlock.title);
      setDate(timeBlock.date);
      setStartTime(timeBlock.startTime);
      setEndTime(timeBlock.endTime);
      setIsFocus(timeBlock.isFocus);

      // Set date picker
      const dateObj = new Date(timeBlock.date);
      setSelectedDate(dateObj);

      // Set time pickers
      const [startHours, startMinutes] = timeBlock.startTime
        .split(":")
        .map(Number);
      const startDate = new Date();
      startDate.setHours(startHours, startMinutes);
      setSelectedStartTime(startDate);

      const [endHours, endMinutes] = timeBlock.endTime.split(":").map(Number);
      const endDate = new Date();
      endDate.setHours(endHours, endMinutes);
      setSelectedEndTime(endDate);
    } else {
      // Reset form when creating new
      setTitle("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setIsFocus(true);
      setSelectedDate(new Date());
      setSelectedStartTime(new Date());
      setSelectedEndTime(new Date());
    }
  }, [timeBlock, visible]);

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title.");
      return false;
    }
    if (!date) {
      Alert.alert("Error", "Please select a date.");
      return false;
    }
    if (!startTime) {
      Alert.alert("Error", "Please select a start time.");
      return false;
    }
    if (!endTime) {
      Alert.alert("Error", "Please select an end time.");
      return false;
    }

    // Check if end time is after start time
    const startParts = startTime.split(":");
    const endParts = endTime.split(":");

    const startDate = new Date();
    startDate.setHours(parseInt(startParts[0]), parseInt(startParts[1]));

    const endDate = new Date();
    endDate.setHours(parseInt(endParts[0]), parseInt(endParts[1]));

    // If end time is less than start time, assume it's on the next day
    if (endDate <= startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    // Calculate the duration in hours
    const durationHours =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    // Check if the duration is reasonable (e.g. not more than 24 hours)
    if (durationHours > 24) {
      Alert.alert("Error", "Activity cannot last longer than 24 hours.");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // If end time is on the next day, add a note to the title
    const startParts = startTime.split(":");
    const endParts = endTime.split(":");

    const startDate = new Date();
    startDate.setHours(parseInt(startParts[0]), parseInt(startParts[1]));

    const endDate = new Date();
    endDate.setHours(parseInt(endParts[0]), parseInt(endParts[1]));

    let finalTitle = title;
    if (endDate <= startDate) {
      finalTitle = `${title} (overnight)`;
    }

    const timeBlockToSave: TimeBlock = {
      id: timeBlock?.id,
      title: finalTitle,
      date,
      startTime,
      endTime,
      isFocus,
      tasks: [],
    };

    onSave(timeBlockToSave);
    // Reset form
    setTitle("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setIsFocus(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setDate(formattedDate);
    }
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setSelectedStartTime(selectedTime);
      // Format time as HH:MM:SS
      const hours = selectedTime.getHours().toString().padStart(2, "0");
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
      const seconds = selectedTime.getSeconds().toString().padStart(2, "0");
      setStartTime(`${hours}:${minutes}:${seconds}`);
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setSelectedEndTime(selectedTime);
      const hours = selectedTime.getHours().toString().padStart(2, "0");
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
      const seconds = selectedTime.getSeconds().toString().padStart(2, "0");
      setEndTime(`${hours}:${minutes}:${seconds}`);
    }
  };

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View
          style={{ backgroundColor: "#1e1e1e" }}
          className="rounded-lg p-5 w-[90%] max-w-[400px]"
        >
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-bold" style={{ color: "#fff" }}>
              {timeBlock ? "Update Activity" : "Add Activity"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" color="#c1c1c1" size={24} />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="mb-1" style={{ color: "#fff" }}>
              Title
            </Text>
            <TextInput
              style={{
                backgroundColor: "#000",
                color: "#fff",
                borderRadius: 8,
              }}
              className="p-3 mt-1 mb-1"
              value={title}
              onChangeText={setTitle}
              placeholder="Name your activity"
              placeholderTextColor="#888"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-1" style={{ color: "#fff" }}>
              Date
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: "#000", borderRadius: 8 }}
              className="flex-row items-center p-3 mt-1 gap-2"
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                color="#c1c1c1"
                size={20}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{ color: date ? "#fff" : "#888" }}
                className="flex-1"
              >
                {date || "Select date"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
              />
            )}
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="mb-1" style={{ color: "#fff" }}>
                Start Time
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: "#000", borderRadius: 8 }}
                className="flex-row items-center p-3 mt-1 gap-2"
                onPress={() => setShowStartTimePicker(true)}
              >
                <Ionicons
                  name="time-outline"
                  color="#c1c1c1"
                  size={20}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{ color: startTime ? "#fff" : "#888" }}
                  className="flex-1"
                >
                  {startTime || "Select time"}
                </Text>
              </TouchableOpacity>
              {showStartTimePicker && (
                <DateTimePicker
                  value={selectedStartTime}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onStartTimeChange}
                />
              )}
            </View>

            <View className="flex-1 ml-2">
              <Text className="mb-1" style={{ color: "#fff" }}>
                End Time
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: "#000", borderRadius: 8 }}
                className="flex-row items-center p-3 mt-1 gap-2"
                onPress={() => setShowEndTimePicker(true)}
              >
                <Ionicons
                  name="time-outline"
                  color="#c1c1c1"
                  size={20}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{ color: endTime ? "#fff" : "#888" }}
                  className="flex-1"
                >
                  {endTime || "Select time"}
                </Text>
              </TouchableOpacity>
              {showEndTimePicker && (
                <DateTimePicker
                  value={selectedEndTime}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onEndTimeChange}
                />
              )}
            </View>
          </View>

          <View className="my-4">
            <View className="relative h-12 rounded-full overflow-hidden">
              <View
                className="absolute border border-gray-300 bg-black h-full transition-all duration-400 ease-in-out"
                style={{
                  width: "50%",
                  left: isFocus ? "50%" : "0%",
                  borderRadius: 9999,
                }}
              />
              <View className="absolute inset-0 flex-row bg-black">
                <TouchableOpacity
                  className={`flex-1 items-center justify-center z-10 ${
                    !isFocus ? "bg-gray-300" : "bg-black"
                  }`}
                  onPress={() => setIsFocus(false)}
                >
                  <Text
                    className={`font-medium ${
                      !isFocus ? "text-black" : "text-gray-400"
                    }`}
                  >
                    Leisure
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 items-center justify-center z-10 ${
                    isFocus ? "bg-gray-300" : "bg-black"
                  }`}
                  onPress={() => setIsFocus(true)}
                >
                  <Text
                    className={`font-medium ${
                      isFocus ? "text-black" : "text-gray-400"
                    }`}
                  >
                    Focus
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className="p-4 items-center mt-4 rounded-lg bg-gray-300"
            onPress={handleSave}
          >
            <Text className="text-black font-bold">
              {timeBlock ? "Update" : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TimeblockDialog;
