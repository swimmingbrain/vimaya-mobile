import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import ScreenLoader from "@/components/ScreenLoader";
import FocusStatisticsGrid from "@/components/profile/FocusStatisticsGrid";
import FriendsPreview from "@/components/profile/FriendsPreview";
import LogoutButton from "@/components/profile/LogoutButton";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useProfileScreen } from "@/hooks/profile/useProfileScreen";

const Profile = () => {
  const {
    user,
    focusStats,
    friends,
    loading,
    friendsLoading,
    error,
    logout,
  } = useProfileScreen();

  if (loading) {
    return <ScreenLoader />;
  }

  return (
    <SafeAreaView className="bg-black h-full py-8">
      <ScrollView>
        <View className="flex gap-10 px-4 py-4">
          <Header title="Profile" icon="arrow-back" />
          <ProfileHeader user={user} />
          <FocusStatisticsGrid stats={focusStats} />
          <FriendsPreview
            friends={friends}
            isLoading={friendsLoading}
            error={error}
          />
          <LogoutButton onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
