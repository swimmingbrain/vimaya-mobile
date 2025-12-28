import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import FriendRequestForm from "@/components/FriendRequestForm";
import ScreenLoader from "@/components/ScreenLoader";
import FriendRequestsList from "@/components/friends/FriendRequestsList";
import FriendsList from "@/components/friends/FriendsList";
import FriendsTabs from "@/components/friends/FriendsTabs";
import { useFriendsScreen } from "@/hooks/friends/useFriendsScreen";
import { colors } from "@/utils/theme";

const Friends = () => {
  const {
    friends,
    friendRequests,
    loading,
    actionLoading,
    error,
    activeTab,
    setActiveTab,
    handleAcceptRequest,
    handleRejectRequest,
    handleRemoveFriend,
    handleRequestSent,
  } = useFriendsScreen();

  if (loading && friends.length === 0 && friendRequests.length === 0) {
    return <ScreenLoader />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, paddingVertical: 16 }}>
      <ScrollView>
        <View style={{ gap: 24, paddingHorizontal: 16, paddingVertical: 16 }}>
          <Header title="Friends" icon="arrow-back" />
          <FriendsTabs
            activeTab={activeTab}
            friendCount={friends.length}
            requestCount={friendRequests.length}
            onChange={setActiveTab}
          />
          <FriendRequestForm onRequestSent={handleRequestSent} />
          {loading ? (
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
              <ActivityIndicator size="large" color={colors.warm} />
            </View>
          ) : error ? (
            <View style={{ backgroundColor: colors.error + "20", padding: 16, borderRadius: 12 }}>
              <Text style={{ color: colors.error }}>{error}</Text>
            </View>
          ) : activeTab === "friends" ? (
            <FriendsList
              friends={friends}
              onRemove={handleRemoveFriend}
              isLoading={actionLoading}
            />
          ) : (
            <FriendRequestsList
              requests={friendRequests}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              isLoading={actionLoading}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Friends;
