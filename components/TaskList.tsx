import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { getAllTasks, deleteTask, updateTask } from "@/services/TaskService";
import { Task } from "@/types/types";
import TaskDialog from "./TaskDialog";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/utils/theme";

const TaskList = () => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"open" | "completed">("open");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getAllTasks();
      setTasks(data);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Error loading tasks.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        setTasks([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      fetchTasks();
    }, [fetchTasks, isAuthenticated])
  );

  const openTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  const handleToggle = async (task: Task) => {
    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description ?? "",
        dueDate: task.dueDate,
        isCompleted: !task.isCompleted,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t))
      );
    } catch {
      Alert.alert("Error", "Unable to change status.");
    }
  };

  const handleDelete = async (taskId: number) => {
    Alert.alert("Confirm deletion", "Do you really want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTask(taskId);
          setTasks((prev) => prev.filter((t) => t.id !== taskId));
        },
      },
    ]);
  };

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    } else {
      setTasks((prev) => [...prev, task]);
    }
    setDialogVisible(false);
    setEditingTask(null);
  };

  const formatDate = (iso: string) => {
    const datePart = iso.split("T")[0];
    const [year, month, day] = datePart.split("-");
    return day + "." + month + "." + year;
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.warm} />;
  }

  return (
    <View style={{ flex: 1, paddingVertical: 8 }}>
      {/* Section Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>Tasks</Text>
        <TouchableOpacity
          onPress={() => { setEditingTask(null); setDialogVisible(true); }}
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
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: "500" }}>Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: "row", marginBottom: 16, gap: 8 }}>
        <TouchableOpacity
          onPress={() => setActiveTab("open")}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            borderRadius: 10,
            backgroundColor: activeTab === "open" ? colors.warm : colors.surface,
          }}
        >
          <Text style={{ fontWeight: "600", color: activeTab === "open" ? colors.text : colors.muted }}>
            Open Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("completed")}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            borderRadius: 10,
            backgroundColor: activeTab === "completed" ? colors.cool : colors.surface,
          }}
        >
          <Text style={{ fontWeight: "600", color: activeTab === "completed" ? colors.text : colors.muted }}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task Lists */}
      {activeTab === "open" ? (
        openTasks.length === 0 ? (
          <Text style={{ color: colors.muted, textAlign: "center" }}>No open tasks...</Text>
        ) : (
          openTasks.map((task) => (
            <View
              key={task.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: colors.surface2,
              }}
            >
              <TouchableOpacity onPress={() => handleToggle(task)} style={{ marginRight: 12 }}>
                <Ionicons name="ellipse-outline" size={22} color={colors.muted} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setEditingTask(task); setDialogVisible(true); }}
                style={{ flex: 1 }}
              >
                <Text style={{ color: colors.text, fontSize: 15 }}>{task.title}</Text>
                {task.dueDate != null && (
                  <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>{formatDate(task.dueDate)}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(task.id)}>
                <Ionicons name="trash-outline" color={colors.muted} size={18} />
              </TouchableOpacity>
            </View>
          ))
        )
      ) : completedTasks.length === 0 ? (
        <Text style={{ color: colors.muted, textAlign: "center" }}>No completed tasks.</Text>
      ) : (
        completedTasks.map((task) => (
          <View
            key={task.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.surface,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: colors.surface2,
            }}
          >
            <TouchableOpacity onPress={() => handleToggle(task)} style={{ marginRight: 12 }}>
              <Ionicons name="checkmark-circle-outline" size={22} color={colors.success} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 15, textDecorationLine: "line-through" }}>{task.title}</Text>
              {task.dueDate != null && (
                <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4, opacity: 0.7 }}>{formatDate(task.dueDate)}</Text>
              )}
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => handleToggle(task)}>
                <Text style={{ color: colors.cool, fontSize: 13 }}>Undo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(task.id)}>
                <Ionicons name="trash-outline" color={colors.muted} size={18} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <TaskDialog
        visible={dialogVisible}
        onClose={() => { setDialogVisible(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </View>
  );
};

export default TaskList;
