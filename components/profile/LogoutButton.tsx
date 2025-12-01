import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface LogoutButtonProps {
  onPress: () => void;
}

const LogoutButton = ({ onPress }: LogoutButtonProps) => (
  <TouchableOpacity className="bg-red-400/15 p-4 rounded-lg" onPress={onPress}>
    <Text className="text-red-400/60 text-center font-semibold">Logout</Text>
  </TouchableOpacity>
);

export default LogoutButton;
