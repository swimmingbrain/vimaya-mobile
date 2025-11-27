import { API_CONFIG } from "./ApiConfig";
import { getToken } from "./auth";

export interface DailyStatisticsDTO {
  id: number;
  userId: string;
  date: string;
  totalFocusTime: number;
  username?: string;
  level?: number;
  xp?: number;
}

export const getDailyStatistics = async (date?: Date, friendId?: string): Promise<DailyStatisticsDTO[]> => {
  try {
    const token = await getToken();
    if (!token) {
      console.debug("Skipping statistics fetch: no auth token present");
      return [];
    }

    const url = new URL(`${API_CONFIG.BASE_URL}/api/DailyStatistics`);
    if (friendId) {
      url.searchParams.append('friendId', friendId);
    }
    if (date) {
      url.searchParams.append('date', date.toISOString());
    }

    console.log('Fetching statistics from:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 500) {
        console.log('Statistics fetch returned 500, returning empty array');
        return [];
      }
      const errorText = await response.text();
      console.error('Statistics API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch daily statistics: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Received statistics:', data);
    return data;
  } catch (error) {
    console.error('Error fetching daily statistics:', error);
    return [];
  }
};

export const updateDailyStatistics = async (statistics: DailyStatisticsDTO): Promise<void> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log('Updating statistics:', statistics);

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/DailyStatistics/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(statistics),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Statistics update API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to update daily statistics: ${response.status} ${response.statusText}`);
    }

    console.log('Statistics updated successfully');
  } catch (error) {
    console.error('Error updating daily statistics:', error);
    throw error;
  }
}; 
