import { API_CONFIG, withApiHeaders } from '@/services/ApiConfig';
import { getToken } from './auth';

// Simple event emitter for friend notifications
class FriendNotificationService {
  private listeners: {
    receiveFriendRequest: ((userId: string, username: string) => void)[];
    friendRequestAccepted: ((userId: string) => void)[];
    friendRequestRejected: ((userId: string) => void)[];
  } = {
    receiveFriendRequest: [],
    friendRequestAccepted: [],
    friendRequestRejected: []
  };

  constructor() {
    // Initialize polling for friend requests
    this.startPolling();
  }

  private startPolling() {
    // Poll for friend requests every 30 seconds
    setInterval(async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Check for new friend requests
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/Friendship/requests`, {
          method: 'GET',
          headers: withApiHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          })
        });

        if (response.ok) {
          const requests = await response.json();
          // If there are new requests, notify listeners
          if (requests && requests.length > 0) {
            requests.forEach((request: any) => {
              this.notifyReceiveFriendRequest(request.userId, request.friendUsername);
            });
          }
        }
      } catch (error) {
        console.error('Error polling for friend requests:', error);
      }
    }, 30000); // 30 seconds
  }

  private notifyReceiveFriendRequest(userId: string, username: string) {
    this.listeners.receiveFriendRequest.forEach(listener => {
      listener(userId, username);
    });
  }

  private notifyFriendRequestAccepted(userId: string) {
    this.listeners.friendRequestAccepted.forEach(listener => {
      listener(userId);
    });
  }

  private notifyFriendRequestRejected(userId: string) {
    this.listeners.friendRequestRejected.forEach(listener => {
      listener(userId);
    });
  }

  public onReceiveFriendRequest(callback: (userId: string, username: string) => void) {
    this.listeners.receiveFriendRequest.push(callback);
  }

  public onFriendRequestAccepted(callback: (userId: string) => void) {
    this.listeners.friendRequestAccepted.push(callback);
  }

  public onFriendRequestRejected(callback: (userId: string) => void) {
    this.listeners.friendRequestRejected.push(callback);
  }

  public removeAllListeners() {
    this.listeners.receiveFriendRequest = [];
    this.listeners.friendRequestAccepted = [];
    this.listeners.friendRequestRejected = [];
  }
}

export const signalRService = new FriendNotificationService(); 
