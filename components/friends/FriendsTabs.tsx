import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FriendsTab } from "@/hooks/friends/useFriendsScreen";

interface FriendsTabsProps {
  activeTab: FriendsTab;
  friendCount: number;
  requestCount: number;
  onChange: (tab: FriendsTab) => void;
}

const FriendsTabs = ({
  activeTab,
  friendCount,
  requestCount,
  onChange,
}: FriendsTabsProps) => (
  <View className="flex-row bg-secondary/10 rounded-lg p-1">
    <TouchableOpacity
      className={`flex-1 p-2 rounded ${
        activeTab === "friends" ? "bg-primary" : ""
      }`}
      onPress={() => onChange("friends")}
    >
      <Text
        className={`text-center font-medium ${
          activeTab === "friends" ? "text-white" : "text-secondary"
        }`}
      >
        Friends ({friendCount})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      className={`flex-1 p-2 rounded ${
        activeTab === "requests" ? "bg-primary" : ""
      }`}
      onPress={() => onChange("requests")}
    >
      <Text
        className={`text-center font-medium ${
          activeTab === "requests" ? "text-white" : "text-secondary"
        }`}
      >
        Requests ({requestCount})
      </Text>
    </TouchableOpacity>
  </View>
);

export default FriendsTabs;
