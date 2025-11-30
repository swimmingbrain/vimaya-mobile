import { API_CONFIG, withApiHeaders } from '@/services/ApiConfig';
import { getToken } from './auth';

export interface Friendship {
  id: number;
  userId: string;
  friendId: string;
  status: string;
  createdAt: string;
  friendUsername: string;
}

export interface FriendRequestDTO {
  friendId: string;
}

export interface FriendshipResponse {
  status: string;
  message: string;
  friendship?: Friendship;
}

export const getFriends = async (): Promise<Friendship[]> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/Friendship`, {
      method: 'GET',
      headers: withApiHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch friends');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};

export const getFriendRequests = async (): Promise<Friendship[]> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/Friendship/requests`, {
      method: 'GET',
      headers: withApiHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch friend requests');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    throw error;
  }
};

export const getSentFriendRequests = async (): Promise<Friendship[]> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/Friendship/sent`, {
      method: 'GET',
      headers: withApiHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sent friend requests');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching sent friend requests:', error);
    throw error;
  }
};

export const sendFriendRequest = async (friendUsername: string): Promise<FriendshipResponse> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/Friendship/send`, {
      method: 'POST',
      headers: withApiHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }),
      body: JSON.stringify({ friendId: friendUsername })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send friend request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

export const acceptFriendRequest = async (friendshipId: number): Promise<FriendshipResponse> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/Friendship/accept/${friendshipId}`, {
      method: 'POST',
      headers: withApiHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to accept friend request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

export const rejectFriendRequest = async (friendshipId: number): Promise<FriendshipResponse> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/Friendship/reject/${friendshipId}`, {
      method: 'POST',
      headers: withApiHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reject friend request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

export const removeFriend = async (friendshipId: number): Promise<boolean> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/Friendship/${friendshipId}`, {
      method: 'DELETE',
      headers: withApiHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    });

    if (!response.ok) {
      throw new Error('Failed to remove friend');
    }

    return true;
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
}; 
