import { Platform } from "react-native";
import Constants from "expo-constants";

function normalizeUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv && fromEnv.trim().length > 0) {
    return normalizeUrl(fromEnv.trim());
  }

  // Fallback: try host from Expo dev if available, else localhost
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:5139`;
  }

  return "http://localhost:5139";
}

export const API_CONFIG = {
  BASE_URL: resolveBaseUrl(),
  headers: {
    accept: "application/json",
  },
};
