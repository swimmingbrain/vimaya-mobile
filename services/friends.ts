import { API_CONFIG, withApiHeaders } from "./ApiConfig";
import { Friendship } from "@/types/types";
import { getToken } from "./auth";

export async function getFriends(): Promise<Friendship[]> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/Friendship`, {
      method: "GET",
      headers: withApiHeaders({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Friends API error response: ${errorData}`);
      throw new Error(
        errorData || `Failed to fetch friends (Status: ${response.status})`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching friends:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}
