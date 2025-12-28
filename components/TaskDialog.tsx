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
import { colors } from "@/utils/theme";

interface TaskDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task | null;
}

const TaskDialog: React.FC<TaskDialogProps> = ({ visible, onClose, onSave, task }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    } else {
      setTitle("");
      setDescription("");
      setDueDate(undefined);
    }
  }, [task, visible]);

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
        await updateTask(task.id, taskData);
        onSave({ ...task, ...taskData });
      } else {
        const newTask = await createTask(taskData);
        onSave(newTask);
      }
      onClose();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save task");
    } finally {
      setSaving(false);
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
              {task ? "Edit Task" : "Add Task"}
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
              placeholder="Enter task title"
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>Description (optional)</Text>
            <TextInput
              style={{ ...inputStyle, minHeight: 80, textAlignVertical: "top" }}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              placeholderTextColor={colors.muted}
              multiline
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>Due Date (optional)</Text>
            <TouchableOpacity
              style={{
                ...inputStyle,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" color={colors.muted} size={18} style={{ marginRight: 10 }} />
              <Text style={{ color: dueDate ? colors.text : colors.muted, flex: 1 }}>
                {dueDate ? dueDate.toLocaleDateString() : "Select due date"}
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
            style={{
              backgroundColor: colors.warm,
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>
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
