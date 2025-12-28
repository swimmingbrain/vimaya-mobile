import Constants from "expo-constants";

const PRODUCTION_API_URL = "https://api.vimaya.app";

function resolveBaseUrl(): string {
  const envUrl = Constants.expoConfig?.extra?.apiUrl;
  if (envUrl) {
    return envUrl.endsWith("/") ? envUrl.slice(0, -1) : envUrl;
  }

  if (__DEV__) {
    return "http://192.168.1.20:5139";
  }

  return PRODUCTION_API_URL;
}

export const API_CONFIG = {
  BASE_URL: resolveBaseUrl(),
  headers: {
    accept: "application/json",
  },
};
