import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "@/utils/theme";

const FocusModeButton = () => {
  const router = useRouter();

  const handlePress = () => {
    router.push("/focusmode/FocusMode");
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        backgroundColor: colors.warm,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <Ionicons name="locate-outline" color={colors.text} size={22} />
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>Start Focus Mode</Text>
    </TouchableOpacity>
  );
};

export default FocusModeButton;
