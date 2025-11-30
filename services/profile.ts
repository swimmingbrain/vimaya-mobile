import { API_CONFIG, withApiHeaders } from "./ApiConfig";
import { UpdateXPError, UpdateXPResponse, UserProfile } from "@/types/types";
import { getToken } from "./auth";

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/User/profile`, {
      method: "GET",
      headers: withApiHeaders({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Failed to fetch user profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}

export const updateXP = async (xpToAdd: number): Promise<UpdateXPResponse> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/User/updatexp`, {
      method: "POST",
      headers: withApiHeaders({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }),
      body: JSON.stringify({ xpToAdd }),
    });

    if (!response.ok) {
      const errorData: UpdateXPError = await response.json();
      throw new Error(
        errorData.errors?.join(", ") ||
          `Failed to update XP. Status: ${response.status}`
      );
    }

    return (await response.json()) as UpdateXPResponse;
  } catch (error) {
    console.error("Error updating XP:", error);
    throw error;
  }
};
