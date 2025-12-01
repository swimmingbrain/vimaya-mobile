import { Stack, useRouter, useSegments } from "expo-router";
import "./globals.css";
import { useEffect } from "react";
import ScreenLoader from "@/components/ScreenLoader";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router, segments]);

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
      <Stack.Screen name="index" />
      <Stack.Screen name="focusmode/FocusMode" />
      <Stack.Screen name="friends/Friends" />
      <Stack.Screen name="profile/Profile" />
      <Stack.Screen name="statistics/Statistics" />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
