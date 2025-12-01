import { View, Text, TouchableOpacity } from "react-native";
import React, { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface HeaderProps {
  title: string;
  icon: ComponentProps<typeof Ionicons>["name"];
}

const Header = ({ title, icon }: HeaderProps) => {
  const router = useRouter();

  return (
    <View className="flex flex-row items-center justify-between">
      <View className="flex flex-row gap-2 items-center">
        <TouchableOpacity onPress={() => router.push("/")}>
          <Ionicons name={icon} size={24} color="#c1c1c1" />
        </TouchableOpacity>
        <Text className="text-secondary text-2xl">{title}</Text>
      </View>
      <View className="flex flex-row gap-4">
        <TouchableOpacity onPress={() => router.push("/friends/Friends")}>
          <Ionicons name="people-outline" size={24} color="#c1c1c1" />
        </TouchableOpacity>
        <Ionicons name="calendar-outline" size={24} color="#c1c1c1" />
        <TouchableOpacity onPress={() => router.push("/profile/Profile")}>
          <Ionicons name="person-circle-outline" size={24} color="#c1c1c1" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
