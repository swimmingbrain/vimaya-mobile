import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TimeBlock } from "@/types/types";
import { colors } from "@/utils/theme";

interface TimeblockDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (timeblock: TimeBlock) => void;
  timeBlock?: TimeBlock | null;
}

const TimeblockDialog: React.FC<TimeblockDialogProps> = ({ visible, onClose, onSave, timeBlock }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isFocus, setIsFocus] = useState(true);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState(new Date());

  useEffect(() => {
    if (timeBlock) {
      setTitle(timeBlock.title);
      setDate(timeBlock.date);
      setStartTime(timeBlock.startTime);
      setEndTime(timeBlock.endTime);
      setIsFocus(timeBlock.isFocus);

      const dateObj = new Date(timeBlock.date);
      setSelectedDate(dateObj);

      const [startHours, startMinutes] = timeBlock.startTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(startHours, startMinutes);
      setSelectedStartTime(startDate);

      const [endHours, endMinutes] = timeBlock.endTime.split(":").map(Number);
      const endDate = new Date();
      endDate.setHours(endHours, endMinutes);
      setSelectedEndTime(endDate);
    } else {
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

    const startParts = startTime.split(":");
    const endParts = endTime.split(":");
    const startDate = new Date();
    startDate.setHours(parseInt(startParts[0]), parseInt(startParts[1]));
    const endDate = new Date();
    endDate.setHours(parseInt(endParts[0]), parseInt(endParts[1]));

    if (endDate <= startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    if (durationHours > 24) {
      Alert.alert("Error", "Activity cannot last longer than 24 hours.");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const startParts = startTime.split(":");
    const endParts = endTime.split(":");
    const startDate = new Date();
    startDate.setHours(parseInt(startParts[0]), parseInt(startParts[1]));
    const endDate = new Date();
    endDate.setHours(parseInt(endParts[0]), parseInt(endParts[1]));

    let finalTitle = title;
    if (endDate <= startDate) {
      finalTitle = title + " (overnight)";
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
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setDate(formattedDate);
    }
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setSelectedStartTime(selectedTime);
      const hours = selectedTime.getHours().toString().padStart(2, "0");
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
      const seconds = selectedTime.getSeconds().toString().padStart(2, "0");
      setStartTime(hours + ":" + minutes + ":" + seconds);
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setSelectedEndTime(selectedTime);
      const hours = selectedTime.getHours().toString().padStart(2, "0");
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
      const seconds = selectedTime.getSeconds().toString().padStart(2, "0");
      setEndTime(hours + ":" + minutes + ":" + seconds);
    }
  };

  const inputStyle = {
    backgroundColor: colors.bgAlt,
    borderWidth: 1,
    borderColor: colors.surface2,
    borderRadius: 10,
    padding: 14,
    color: colors.text,
    fontSize: 15,
  };

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            width: "90%",
            maxWidth: 400,
            borderWidth: 1,
            borderColor: colors.surface2,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
              {timeBlock ? "Update Activity" : "Add Activity"}
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" color={colors.muted} size={24} />
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>Title</Text>
            <TextInput
              style={inputStyle}
              value={title}
              onChangeText={setTitle}
              placeholder="Name your activity"
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>Date</Text>
            <TouchableOpacity
              style={{ ...inputStyle, flexDirection: "row", alignItems: "center" }}
              onPress={() => {
                setShowStartTimePicker(false);
                setShowEndTimePicker(false);
                setShowDatePicker(true);
              }}
            >
              <Ionicons name="calendar-outline" color={colors.muted} size={18} style={{ marginRight: 10 }} />
              <Text style={{ color: date ? colors.text : colors.muted, flex: 1 }}>
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

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>Start Time</Text>
              <TouchableOpacity
                style={{ ...inputStyle, flexDirection: "row", alignItems: "center" }}
                onPress={() => {
                  setShowDatePicker(false);
                  setShowEndTimePicker(false);
                  setShowStartTimePicker(true);
                }}
              >
                <Ionicons name="time-outline" color={colors.muted} size={18} style={{ marginRight: 10 }} />
                <Text style={{ color: startTime ? colors.text : colors.muted }}>
                  {startTime || "Select"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>End Time</Text>
              <TouchableOpacity
                style={{ ...inputStyle, flexDirection: "row", alignItems: "center" }}
                onPress={() => {
                  setShowDatePicker(false);
                  setShowStartTimePicker(false);
                  setShowEndTimePicker(true);
                }}
              >
                <Ionicons name="time-outline" color={colors.muted} size={18} style={{ marginRight: 10 }} />
                <Text style={{ color: endTime ? colors.text : colors.muted }}>
                  {endTime || "Select"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStartTimePicker && (
            <View style={{ marginBottom: 16 }}>
              <DateTimePicker
                value={selectedStartTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onStartTimeChange}
              />
            </View>
          )}
          {showEndTimePicker && (
            <View style={{ marginBottom: 16 }}>
              <DateTimePicker
                value={selectedEndTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onEndTimeChange}
              />
            </View>
          )}

          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>Type</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  alignItems: "center",
                  borderRadius: 10,
                  backgroundColor: !isFocus ? colors.cool : colors.bgAlt,
                  borderWidth: 1,
                  borderColor: !isFocus ? colors.cool : colors.surface2,
                }}
                onPress={() => setIsFocus(false)}
              >
                <Text style={{ color: colors.text, fontWeight: "500" }}>Leisure</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  alignItems: "center",
                  borderRadius: 10,
                  backgroundColor: isFocus ? colors.warm : colors.bgAlt,
                  borderWidth: 1,
                  borderColor: isFocus ? colors.warm : colors.surface2,
                }}
                onPress={() => setIsFocus(true)}
              >
                <Text style={{ color: colors.text, fontWeight: "500" }}>Focus</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: isFocus ? colors.warm : colors.cool,
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
            onPress={handleSave}
          >
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>
              {timeBlock ? "Update" : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TimeblockDialog;
