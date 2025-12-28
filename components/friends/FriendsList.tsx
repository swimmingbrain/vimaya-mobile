import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import FriendItem from "@/components/FriendItem";
import { Friendship } from "@/services/friendship";
import { colors } from "@/utils/theme";
import { getActiveFriendSessions, ActiveFriendSession } from "@/services/focusSession";

interface FriendsListProps {
  friends: Friendship[];
  onRemove: (friendshipId: number) => void;
  isLoading: boolean;
}

const FriendsList = ({ friends, onRemove, isLoading }: FriendsListProps) => {
  const [liveSessions, setLiveSessions] = useState<Map<string, ActiveFriendSession>>(new Map());

  useEffect(() => {
    const loadLiveSessions = async () => {
      try {
        const sessions = await getActiveFriendSessions();
        const sessionMap = new Map<string, ActiveFriendSession>();
        sessions.forEach((session) => {
          sessionMap.set(session.userId, session);
        });
        setLiveSessions(sessionMap);
      } catch (error) {
        console.error("Error loading live sessions:", error);
      }
    };

    loadLiveSessions();

    // Refresh every 10 seconds
    const interval = setInterval(loadLiveSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sort friends: live friends first, then by created date
  const sortedFriends = [...friends].sort((a, b) => {
    const aIsLive = liveSessions.has(a.friendId);
    const bIsLive = liveSessions.has(b.friendId);
    if (aIsLive && !bIsLive) return -1;
    if (!aIsLive && bIsLive) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const liveCount = friends.filter((f) => liveSessions.has(f.friendId)).length;

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>
          Your Friends
        </Text>
        {liveCount > 0 && (
          <View
            style={{
              backgroundColor: colors.warm,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 10,
              marginLeft: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.text,
                marginRight: 4,
              }}
            />
            <Text style={{ color: colors.text, fontSize: 11, fontWeight: "600" }}>
              {liveCount} LIVE
            </Text>
          </View>
        )}
      </View>
      {friends.length === 0 ? (
        <View
          style={{
            backgroundColor: colors.surface,
            padding: 20,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.muted }}>You don't have any friends yet.</Text>
        </View>
      ) : (
        sortedFriends.map((friend) => {
          const liveSession = liveSessions.get(friend.friendId);
          return (
            <FriendItem
              key={friend.id}
              friend={friend}
              onRemove={onRemove}
              isLoading={isLoading}
              isLive={!!liveSession}
              focusStartTime={liveSession?.startTime}
            />
          );
        })
      )}
    </View>
  );
};

export default FriendsList;
