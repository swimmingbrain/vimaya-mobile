import { ApiResponse, TimeBlock } from "@/types/types";
import { API_CONFIG, withApiHeaders } from "./ApiConfig";
import { getToken } from "./auth";

export async function getTimeBlocks(): Promise<TimeBlock[]> {
  try {
    const token = await getToken();
    if (!token) {
      console.debug("Skipping time block fetch: no auth token present");
      return [];
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/TimeBlock`, {
      method: "GET",
      headers: withApiHeaders({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      const parsedError = JSON.parse(errorData) as ApiResponse;
      throw new Error(parsedError.message);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching time blocks:", error);
    throw error;
  }
}

export async function getTimeBlockById(
  id: string | number
): Promise<TimeBlock> {
  try {
    const token = await getToken();
    if (!token) {
      console.debug("Skipping time block fetch by id: no auth token present");
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/TimeBlock/${id}`, {
      method: "GET",
      headers: withApiHeaders({
        Authorization: `Bearer ${token}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      const parsedError = JSON.parse(errorData) as ApiResponse;
      throw new Error(parsedError.message);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching time block with ID ${id}:`, error);
    throw error;
  }
}

export async function createTimeBlock(
  timeBlock: TimeBlock
): Promise<TimeBlock> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/TimeBlock`, {
      method: "POST",
      headers: withApiHeaders({
        Authorization: `Bearer ${token}`,
        Accept: "*/*", // Match the curl request
        "Content-Type": "application/json", // Be explicit about content type
      }),
      body: JSON.stringify({
        ...timeBlock,
        date: timeBlock.date, // Send date as a plain string to match curl (for debugging)
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      let parsedError;
      try {
        parsedError = JSON.parse(errorData) as ApiResponse;
      } catch (e) {
        console.error("Failed to parse error JSON:", e);
        throw new Error(
          `Request failed with status ${response.status}: ${errorData}`
        );
      }
      throw new Error(
        parsedError.message ||
          `Request failed with status ${response.status}: ${errorData}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error creating time block:", error);
    throw error;
  }
}

export async function updateTimeBlock(
  timeBlock: TimeBlock
): Promise<TimeBlock | null> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Authentication required");
    }
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/TimeBlock/${timeBlock.id}`,
      {
        method: "PUT",
        headers: withApiHeaders({
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          ...timeBlock,
          date: new Date(timeBlock.date).toISOString(), // Ensure ISO format
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      if (errorData) {
        const parsedError = JSON.parse(errorData) as ApiResponse;
        throw new Error(parsedError.message);
      } else {
        throw new Error("An unknown error occurred.");
      }
    }

    // If response has no content (204 No Content)
    if (response.status === 204) {
      console.log("Time block updated successfully, but no content returned.");
      return null;
    }

    // If response has a body, parse and return the updated time block
    return response.json();
  } catch (error) {
    console.error(`Error updating time block with ID ${timeBlock.id}:`, error);
    throw error;
  }
}

export async function deleteTimeBlock(
  id: string
): Promise<void> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Authentication required");
    }
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/TimeBlock/${id}`, {
      method: "DELETE",
      headers: withApiHeaders({
        Authorization: `Bearer ${token}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      const parsedError = JSON.parse(errorData) as ApiResponse;
      throw new Error(parsedError.message);
    }

    console.log(`Time block with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting time block with ID ${id}:`, error);
    throw error;
  }
}
