import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FriendsTab } from "@/hooks/friends/useFriendsScreen";
import { colors } from "@/utils/theme";

interface FriendsTabsProps {
  activeTab: FriendsTab;
  friendCount: number;
  requestCount: number;
  onChange: (tab: FriendsTab) => void;
}

const FriendsTabs = ({ activeTab, friendCount, requestCount, onChange }: FriendsTabsProps) => (
  <View style={{ flexDirection: "row", gap: 8 }}>
    <TouchableOpacity
      style={{
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: activeTab === "friends" ? colors.cool : colors.surface,
        borderWidth: 1,
        borderColor: activeTab === "friends" ? colors.cool : colors.surface2,
      }}
      onPress={() => onChange("friends")}
    >
      <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
        Friends ({friendCount})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={{
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: activeTab === "requests" ? colors.warm : colors.surface,
        borderWidth: 1,
        borderColor: activeTab === "requests" ? colors.warm : colors.surface2,
      }}
      onPress={() => onChange("requests")}
    >
      <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
        Requests ({requestCount})
      </Text>
    </TouchableOpacity>
  </View>
);

export default FriendsTabs;
