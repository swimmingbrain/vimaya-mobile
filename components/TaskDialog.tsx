import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Task } from "@/types/types";
import { createTask, updateTask } from "@/services/TaskService";

interface TaskDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task | null;
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  visible,
  onClose,
  onSave,
  task,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load task data when editing
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    } else {
      // Reset form when creating new
      setTitle("");
      setDescription("");
      setDueDate(undefined);
    }
  }, [task, visible]);

  // Auto-default dueDate to today on first open of picker
  useEffect(() => {
    if (showDatePicker && dueDate === undefined) {
      setDueDate(new Date());
    }
  }, [showDatePicker]);

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required");
      return false;
    }
    // Prevent past-dates
    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sel = new Date(dueDate);
      sel.setHours(0, 0, 0, 0);
      if (sel < today) {
        Alert.alert("Validation", "Due date cannot be in the past");
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate?.toISOString(),
        isCompleted: task?.isCompleted ?? false,
      };

      if (task?.id) {
        // Update existing task
        await updateTask(task.id, taskData);
        onSave({ ...task, ...taskData });
      } else {
        // Create new task
        const newTask = await createTask(taskData);
        onSave(newTask);
      }
      onClose();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to save task"
      );
    } finally {
      setSaving(false);
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
              {task ? "Edit Task" : "Add Task"}
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
              placeholder="Enter task title"
              placeholderTextColor="#888"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-1" style={{ color: "#fff" }}>
              Description (optional)
            </Text>
            <TextInput
              style={{
                backgroundColor: "#000",
                color: "#fff",
                borderRadius: 8,
              }}
              className="p-3 mt-1 mb-1"
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              placeholderTextColor="#888"
              multiline
            />
          </View>

          <View className="mb-4">
            <Text className="mb-1" style={{ color: "#fff" }}>
              Due Date (optional)
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: "#000", borderRadius: 8 }}
              className="flex-row items-center p-3 mt-1"
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                color="#c1c1c1"
                size={20}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{ color: dueDate ? "#fff" : "#888" }}
                className="flex-1"
              >
                {dueDate ? dueDate.toLocaleDateString() : "  Select due date"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) setDueDate(date);
                }}
              />
            )}
          </View>

          <TouchableOpacity
            style={{ backgroundColor: "#fff", borderRadius: 8 }}
            className="p-4 items-center mt-4"
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={{ color: "#000", fontWeight: "bold" }}>
                {task ? "Update" : "Save"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TaskDialog;
