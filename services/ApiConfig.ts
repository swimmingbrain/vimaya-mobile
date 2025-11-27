import { Platform } from "react-native";
import Constants from "expo-constants";

function normalizeUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function resolveBaseUrl(): string {
  // IP Placeholder for testing till backend is online available
  return "http://192.168.1.20:5139";
}

export const API_CONFIG = {
  BASE_URL: resolveBaseUrl(),
  headers: {
    accept: "application/json",
  },
};
