import { View, Text, TouchableOpacity } from "react-native";
import React, { ComponentProps } from "react";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/utils/theme";

interface HeaderProps {
  title: string;
  icon: ComponentProps<typeof Ionicons>["name"];
}

const Header = ({ title, icon }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = (path: string) => {
    // Normalize paths for comparison
    const currentPath = pathname === "/" ? "/" : pathname;
    const targetPath = path === "/" ? "/" : path;
    
    // Don't navigate if already on the same page
    if (currentPath === targetPath) return;
    
    // Use replace to avoid stacking screens
    router.replace(path as any);
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/" || pathname === "/index";
    return pathname.startsWith(path);
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => navigateTo("/")}
          style={{
            backgroundColor: isActive("/") ? colors.warm : colors.surface,
            padding: 8,
            borderRadius: 10,
          }}
        >
          <Ionicons name={icon} size={20} color={isActive("/") ? colors.text : colors.muted} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: "600" }}>{title}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          onPress={() => navigateTo("/friends/Friends")}
          style={{
            backgroundColor: isActive("/friends") ? colors.cool : colors.surface,
            padding: 8,
            borderRadius: 10,
          }}
        >
          <Ionicons name="people-outline" size={20} color={isActive("/friends") ? colors.text : colors.muted} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigateTo("/statistics/Statistics")}
          style={{
            backgroundColor: isActive("/statistics") ? colors.cool : colors.surface,
            padding: 8,
            borderRadius: 10,
          }}
        >
          <Ionicons name="stats-chart-outline" size={20} color={isActive("/statistics") ? colors.text : colors.muted} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigateTo("/profile/Profile")}
          style={{
            backgroundColor: isActive("/profile") ? colors.cool : colors.surface,
            padding: 8,
            borderRadius: 10,
          }}
        >
          <Ionicons name="person-circle-outline" size={20} color={isActive("/profile") ? colors.text : colors.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
