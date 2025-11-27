import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  acceptFriendRequest,
  getFriendRequests,
  getFriends,
  rejectFriendRequest,
  removeFriend,
  Friendship,
} from "@/services/friendship";
import { signalRService } from "@/services/signalR";
import { useAuth } from "@/contexts/AuthContext";

export type FriendsTab = "friends" | "requests";

export const useFriendsScreen = () => {
  const { isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FriendsTab>("friends");

  const refreshFriends = useCallback(async () => {
    if (!isAuthenticated) {
      setFriends([]);
      return;
    }
    try {
      const loadedFriends = await getFriends();
      setFriends(loadedFriends);
    } catch (err) {
      console.error("Error loading friends:", err);
      setError(
        err instanceof Error
          ? `Failed to load friends: ${err.message}`
          : "Failed to load friends: Unknown error",
      );
    }
  }, [isAuthenticated]);

  const refreshFriendRequests = useCallback(async () => {
    if (!isAuthenticated) {
      setFriendRequests([]);
      return;
    }
    try {
      const requests = await getFriendRequests();
      setFriendRequests(requests);
    } catch (err) {
      console.error("Error loading friend requests:", err);
      setError(
        err instanceof Error
          ? `Failed to load friend requests: ${err.message}`
          : "Failed to load friend requests: Unknown error",
      );
    }
  }, [isAuthenticated]);

  const initialize = useCallback(async () => {
    if (!isAuthenticated) {
      setFriends([]);
      setFriendRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    await Promise.allSettled([refreshFriends(), refreshFriendRequests()]);
    setLoading(false);
  }, [isAuthenticated, refreshFriends, refreshFriendRequests]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      signalRService.removeAllListeners();
      return;
    }

    signalRService.onReceiveFriendRequest((_userId, username) => {
      Alert.alert(
        "New Friend Request",
        `${username} sent you a friend request`,
        [
          {
            text: "View",
            onPress: () => {
              setActiveTab("requests");
              refreshFriendRequests();
            },
          },
          { text: "Later", style: "cancel" },
        ],
      );
    });

    signalRService.onFriendRequestAccepted(() => {
      Alert.alert(
        "Friend Request Accepted",
        "Your friend request was accepted",
        [
          {
            text: "View Friends",
            onPress: () => {
              setActiveTab("friends");
              refreshFriends();
            },
          },
          { text: "OK", style: "cancel" },
        ],
      );
    });

    signalRService.onFriendRequestRejected(() => {
      Alert.alert("Friend Request Rejected", "Your friend request was rejected");
    });

    return () => {
      signalRService.removeAllListeners();
    };
  }, [isAuthenticated, refreshFriends, refreshFriendRequests]);

  const handleAcceptRequest = useCallback(
    async (friendshipId: number) => {
      try {
        setActionLoading(true);
        await acceptFriendRequest(friendshipId);
        await Promise.allSettled([
          refreshFriendRequests(),
          refreshFriends(),
        ]);
      } catch (err) {
        console.error("Error accepting friend request:", err);
        Alert.alert("Error", "Failed to accept friend request");
      } finally {
        setActionLoading(false);
      }
    },
    [refreshFriends, refreshFriendRequests],
  );

  const handleRejectRequest = useCallback(
    async (friendshipId: number) => {
      try {
        setActionLoading(true);
        await rejectFriendRequest(friendshipId);
        await refreshFriendRequests();
      } catch (err) {
        console.error("Error rejecting friend request:", err);
        Alert.alert("Error", "Failed to reject friend request");
      } finally {
        setActionLoading(false);
      }
    },
    [refreshFriendRequests],
  );

  const handleRemoveFriend = useCallback(
    (friendshipId: number) => {
      Alert.alert(
        "Remove Friend",
        "Are you sure you want to remove this friend?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                setActionLoading(true);
                await removeFriend(friendshipId);
                await refreshFriends();
              } catch (err) {
                console.error("Error removing friend:", err);
                Alert.alert("Error", "Failed to remove friend");
              } finally {
                setActionLoading(false);
              }
            },
          },
        ],
      );
    },
    [refreshFriends],
  );

  const handleRequestSent = useCallback(() => {
    if (isAuthenticated) {
      refreshFriends();
    }
  }, [isAuthenticated, refreshFriends]);

  return {
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
  };
};
