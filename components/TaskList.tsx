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

const TaskList = () => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"open" | "completed">("open");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    try {
      const data = await getAllTasks();
      setTasks(data);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Error loading tasks."
      );
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
        prev.map((t) =>
          t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
        )
      );
    } catch {
      Alert.alert("Error", "Unable to change status.");
    }
  };

  const handleDelete = async (taskId: number) => {
    Alert.alert(
      "Confirm deletion",
      "Do you really want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteTask(taskId);
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
          },
        },
      ]
    );
  };

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? task : t))
      );
    } else {
      setTasks((prev) => [...prev, task]);
    }
    setDialogVisible(false);
    setEditingTask(null);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#fff" />;
  }

  // Helper to format ISO date string as DD.MM.YYYY
  const formatDate = (iso: string) => {
    const datePart = iso.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}.${month}.${year}`;
  };

  return (
    <View className="flex-1 bg-black p-4">
      {/* Tabs */}
      <View className="flex flex-row mb-4">
        <TouchableOpacity
          onPress={() => setActiveTab("open")}
          className={`flex-1 py-2 items-center rounded-t-lg ${
            activeTab === "open" ? "bg-secondary" : "bg-primary"
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === "open" ? "text-primary" : "text-secondary"
            }`}
          >
            Open Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("completed")}
          className={`flex-1 py-2 items-center rounded-t-lg ${
            activeTab === "completed" ? "bg-secondary" : "bg-primary"
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === "completed" ? "text-primary" : "text-secondary"
            }`}
          >
            Completed Tasks
          </Text>
        </TouchableOpacity>
      </View>

      {/* + Add Task only on Open tab */}
      {activeTab === "open" && (
        <TouchableOpacity
          onPress={() => {
            setEditingTask(null);
            setDialogVisible(true);
          }}
          className="flex flex-row items-center justify-end mb-2"
        >
          <Ionicons name="add" color="#c1c1c1" size={20} />
          <Text className="text-secondary"> Add Task</Text>
        </TouchableOpacity>
      )}

      {/* Task Lists */}
      {activeTab === "open" ? (
        openTasks.length === 0 ? (
          <Text className="text-secondary text-center">no open tasks...</Text>
        ) : (
          openTasks.map((task) => (
            <View
              key={task.id}
              className="flex flex-row items-center justify-between bg-primary rounded-lg py-4 px-5 mb-2"
            >
              {/* Checkbox */}
              <TouchableOpacity
                onPress={() => handleToggle(task)}
                className="mr-4"
              >
                <Ionicons name="ellipse-outline" size={24} color="#c1c1c1" />
              </TouchableOpacity>

              {/* Title/Details: opens edit dialog on press */}
              <TouchableOpacity
                onPress={() => {
                  setEditingTask(task);
                  setDialogVisible(true);
                }}
                className="flex-1"
              >
                <Text className="text-secondary">{task.title}</Text>
                {task.dueDate != null && (
                  <Text className="text-sm text-gray-400">
                    {formatDate(task.dueDate)}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Delete */}
              <TouchableOpacity onPress={() => handleDelete(task.id)}>
                <Ionicons name="trash-outline" color="#c1c1c1" size={20} />
              </TouchableOpacity>
            </View>
          ))
        )
      ) : completedTasks.length === 0 ? (
        <Text className="text-secondary text-center">No completed tasks.</Text>
      ) : (
        completedTasks.map((task) => (
          <View
            key={task.id}
            className="flex flex-row items-center justify-between bg-primary rounded-lg py-4 px-5 mb-2"
          >
            {/* Completed checkbox */}
            <TouchableOpacity
              onPress={() => handleToggle(task)}
              className="mr-4"
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#4caf50"
              />
            </TouchableOpacity>

            {/* Title/Details: VIEW ONLY in completed */}
            <View className="flex-1">
              <Text className="text-secondary line-through">{task.title}</Text>
              {task.dueDate != null && (
                <Text className="text-sm text-gray-400">
                  {formatDate(task.dueDate)}
                </Text>
              )}
            </View>

            {/* Undo & Delete */}
            <View className="flex flex-row">
              <TouchableOpacity
                onPress={() => handleToggle(task)}
                className="mr-4"
              >
                <Text className="text-blue-400">Undo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(task.id)}>
                <Ionicons name="trash-outline" color="#c1c1c1" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <TaskDialog
        visible={dialogVisible}
        onClose={() => {
          setDialogVisible(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </View>
  );
};

export default TaskList;
