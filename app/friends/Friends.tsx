import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import FriendRequestForm from "@/components/FriendRequestForm";
import ScreenLoader from "@/components/ScreenLoader";
import FriendRequestsList from "@/components/friends/FriendRequestsList";
import FriendsList from "@/components/friends/FriendsList";
import Leaderboard from "@/components/social/Leaderboard";
import { useFriendsScreen } from "@/hooks/friends/useFriendsScreen";
import { colors } from "@/utils/theme";

type TabType = "friends" | "requests" | "leaderboard";

const Friends = () => {
  const {
    friends,
    friendRequests,
    loading,
    actionLoading,
    error,
    activeTab: friendsTab,
    setActiveTab: setFriendsTab,
    handleAcceptRequest,
    handleRejectRequest,
    handleRemoveFriend,
    handleRequestSent,
  } = useFriendsScreen();

  const [activeTab, setActiveTab] = useState<TabType>("friends");

  if (loading && friends.length === 0 && friendRequests.length === 0) {
    return <ScreenLoader />;
  }

  const renderTab = (tab: TabType, label: string, count?: number) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={{
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        backgroundColor: activeTab === tab ? colors.warm : colors.surface,
        borderRadius: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text
          style={{
            color: activeTab === tab ? colors.text : colors.muted,
            fontWeight: "600",
            fontSize: 14,
          }}
        >
          {label}
        </Text>
        {count !== undefined && count > 0 && (
          <View
            style={{
              backgroundColor: activeTab === tab ? colors.text : colors.warm,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 8,
              marginLeft: 6,
            }}
          >
            <Text
              style={{
                color: activeTab === tab ? colors.warm : colors.text,
                fontSize: 11,
                fontWeight: "600",
              }}
            >
              {count}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, paddingVertical: 16 }}>
      <ScrollView>
        <View style={{ gap: 24, paddingHorizontal: 16, paddingVertical: 16 }}>
          <Header title="Friends" icon="arrow-back" />

          {/* Tabs */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 4,
              gap: 4,
            }}
          >
            {renderTab("friends", "Friends", friends.length)}
            {renderTab("requests", "Requests", friendRequests.length)}
            {renderTab("leaderboard", "Ranking")}
          </View>

          {activeTab === "friends" && (
            <>
              <FriendRequestForm onRequestSent={handleRequestSent} />
              {loading ? (
                <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
                  <ActivityIndicator size="large" color={colors.warm} />
                </View>
              ) : error ? (
                <View style={{ backgroundColor: colors.error + "20", padding: 16, borderRadius: 12 }}>
                  <Text style={{ color: colors.error }}>{error}</Text>
                </View>
              ) : (
                <FriendsList
                  friends={friends}
                  onRemove={handleRemoveFriend}
                  isLoading={actionLoading}
                />
              )}
            </>
          )}

          {activeTab === "requests" && (
            <>
              {loading ? (
                <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
                  <ActivityIndicator size="large" color={colors.warm} />
                </View>
              ) : error ? (
                <View style={{ backgroundColor: colors.error + "20", padding: 16, borderRadius: 12 }}>
                  <Text style={{ color: colors.error }}>{error}</Text>
                </View>
              ) : (
                <FriendRequestsList
                  requests={friendRequests}
                  onAccept={handleAcceptRequest}
                  onReject={handleRejectRequest}
                  isLoading={actionLoading}
                />
              )}
            </>
          )}

          {activeTab === "leaderboard" && <Leaderboard />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Friends;
