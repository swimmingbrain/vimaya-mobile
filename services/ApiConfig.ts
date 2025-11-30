import Constants from "expo-constants";

function normalizeUrl(url?: string | null) {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function resolveBaseUrl(): string {
  // IP Placeholder for testing till backend is online available
  const configured = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;
  return normalizeUrl(configured) || "http://192.168.1.20:5139";
}

function resolveApiKey(): string {
  const configured = Constants.expoConfig?.extra?.apiKey as string | undefined;
  return configured?.trim() ?? "";
}

function resolveApiKeyHeader(): string {
  const configured = Constants.expoConfig?.extra?.apiKeyHeader as string | undefined;
  return configured?.trim() || "Vimaya-Api-Key";
}

export const API_CONFIG = {
  BASE_URL: resolveBaseUrl(),
  API_KEY: resolveApiKey(),
  API_KEY_HEADER: resolveApiKeyHeader(),
  headers: {
    Accept: "application/json",
  },
};

export function withApiHeaders(
  headers: Record<string, string> = {}
): Record<string, string> {
  const apiHeaders: Record<string, string> = {
    ...API_CONFIG.headers,
  };

  if (API_CONFIG.API_KEY) {
    apiHeaders[API_CONFIG.API_KEY_HEADER] = API_CONFIG.API_KEY;
  }

  return {
    ...apiHeaders,
    ...headers,
  };
}
