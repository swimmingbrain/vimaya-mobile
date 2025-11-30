import * as SecureStore from "expo-secure-store";
import {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  ApiResponse,
} from "@/types/types";
import { API_CONFIG, withApiHeaders } from "./ApiConfig";

const TOKEN_KEY = "auth_token";

export const saveToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("Error saving token:", error);
    return false;
  }
};

export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return true;
  } catch (error) {
    console.error("Error removing token:", error);
    return false;
  }
};

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/Authenticate/login`,
      {
        method: "POST",
        headers: withApiHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(credentials),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      const parsedError = JSON.parse(errorData) as ApiResponse;
      throw new Error(parsedError.message);
    }

    return response.json();
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function register(data: RegisterRequest): Promise<ApiResponse> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/Authenticate/register`,
      {
        method: "POST",
        headers: withApiHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      const parsedError = JSON.parse(errorData) as ApiResponse;
      throw new Error(parsedError.message);
    }

    return response.json();
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}
