import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import FriendRequestForm from "@/components/FriendRequestForm";
import ScreenLoader from "@/components/ScreenLoader";
import FriendRequestsList from "@/components/friends/FriendRequestsList";
import FriendsList from "@/components/friends/FriendsList";
import FriendsTabs from "@/components/friends/FriendsTabs";
import { useFriendsScreen } from "@/hooks/friends/useFriendsScreen";

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
    <SafeAreaView className="bg-black h-full py-8">
      <ScrollView>
        <View className="flex gap-10 px-4 py-4">
          <Header title="Friends" icon="arrow-back" />
          <FriendsTabs
            activeTab={activeTab}
            friendCount={friends.length}
            requestCount={friendRequests.length}
            onChange={setActiveTab}
          />
          <FriendRequestForm onRequestSent={handleRequestSent} />
          {loading ? (
            <View className="flex items-center justify-center py-10">
              <ActivityIndicator size="large" color="#c1c1c1" />
            </View>
          ) : error ? (
            <View className="bg-red-500/20 p-4 rounded-lg">
              <Text className="text-red-500">{error}</Text>
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
