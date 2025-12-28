import React from "react";
import { Text, View } from "react-native";
import { UserProfile } from "@/types/types";
import { colors } from "@/utils/theme";

interface ProfileHeaderProps {
  user: UserProfile | null;
}

const ProfileHeader = ({ user }: ProfileHeaderProps) => (
  <View style={{ backgroundColor: colors.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.surface2 }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{
          height: 64,
          width: 64,
          borderRadius: 32,
          backgroundColor: colors.warm,
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </Text>
        </View>
        <View style={{ marginLeft: 16 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>
            {user?.username || "Loading..."}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
            {user?.email || "Loading..."}
          </Text>
        </View>
      </View>
      {user && (
        <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
          <View style={{ backgroundColor: colors.cool + "30", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
            <Text style={{ color: colors.cool, fontSize: 14, fontWeight: "600" }}>
              Level {user.level}
            </Text>
          </View>
          <Text style={{ color: colors.muted, fontSize: 13, marginTop: 6 }}>{user.xp} XP</Text>
        </View>
      )}
    </View>
  </View>
);

export default ProfileHeader;
