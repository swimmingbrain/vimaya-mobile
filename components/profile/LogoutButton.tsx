import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { colors } from "@/utils/theme";

interface LogoutButtonProps {
  onPress: () => void;
}

const LogoutButton = ({ onPress }: LogoutButtonProps) => (
  <TouchableOpacity
    style={{
      backgroundColor: colors.error + "20",
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.error + "30",
    }}
    onPress={onPress}
  >
    <Text style={{ color: colors.error, textAlign: "center", fontWeight: "600", fontSize: 15 }}>
      Logout
    </Text>
  </TouchableOpacity>
);

export default LogoutButton;
