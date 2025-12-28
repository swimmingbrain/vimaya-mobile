import { API_CONFIG } from '@/services/ApiConfig';
import { getToken } from './auth';

export interface FocusSession {
  id: number;
  userId: string;
  username: string;
  startTime: string;
  endTime?: string;
  isActive: boolean;
  currentDurationSeconds: number;
  level: number;
}

export interface ActiveFriendSession {
  userId: string;
  username: string;
  startTime: string;
  currentDurationSeconds: number;
  level: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalFocusTimeSeconds: number;
  level: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface ActivityFeedItem {
  type: 'focus_started' | 'focus_ended' | 'level_up';
  userId: string;
  username: string;
  timestamp: string;
  durationSeconds?: number;
  newLevel?: number;
}

export const startFocusSession = async (): Promise<FocusSession> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/FocusSession/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to start focus session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error starting focus session:', error);
    throw error;
  }
};

export const endFocusSession = async (durationSeconds: number): Promise<FocusSession> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/FocusSession/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ durationSeconds })
    });

    if (!response.ok) {
      throw new Error('Failed to end focus session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error ending focus session:', error);
    throw error;
  }
};

export const getActiveFriendSessions = async (): Promise<ActiveFriendSession[]> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/FocusSession/friends/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active friend sessions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching active friend sessions:', error);
    throw error;
  }
};

export const getWeeklyLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/FocusSession/leaderboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

export const getActivityFeed = async (count: number = 20): Promise<ActivityFeedItem[]> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/FocusSession/activity-feed?count=${count}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch activity feed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    throw error;
  }
};

// Real-time polling for live updates (fallback for SignalR)
type FocusEventCallback = (session: ActiveFriendSession) => void;
type LeftFocusCallback = (data: { userId: string; username: string; durationSeconds?: number }) => void;

class FocusSessionPoller {
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private previousSessions: Map<string, ActiveFriendSession> = new Map();
  private joinCallbacks: FocusEventCallback[] = [];
  private leaveCallbacks: LeftFocusCallback[] = [];

  startPolling(intervalMs: number = 5000) {
    if (this.pollingInterval) return;

    this.pollingInterval = setInterval(async () => {
      try {
        const currentSessions = await getActiveFriendSessions();
        const currentMap = new Map(currentSessions.map(s => [s.userId, s]));

        // Check for new sessions (friends who joined)
        for (const session of currentSessions) {
          if (!this.previousSessions.has(session.userId)) {
            this.joinCallbacks.forEach(cb => cb(session));
          }
        }

        // Check for ended sessions (friends who left)
        for (const [userId, session] of this.previousSessions) {
          if (!currentMap.has(userId)) {
            const durationSeconds = Math.floor(
              (Date.now() - new Date(session.startTime).getTime()) / 1000
            );
            this.leaveCallbacks.forEach(cb => cb({
              userId,
              username: session.username,
              durationSeconds
            }));
          }
        }

        this.previousSessions = currentMap;
      } catch (error) {
        console.error('Error polling focus sessions:', error);
      }
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.previousSessions.clear();
  }

  onFriendJoined(callback: FocusEventCallback) {
    this.joinCallbacks.push(callback);
    return () => {
      this.joinCallbacks = this.joinCallbacks.filter(cb => cb !== callback);
    };
  }

  onFriendLeft(callback: LeftFocusCallback) {
    this.leaveCallbacks.push(callback);
    return () => {
      this.leaveCallbacks = this.leaveCallbacks.filter(cb => cb !== callback);
    };
  }

  async initializeSessions(): Promise<ActiveFriendSession[]> {
    const sessions = await getActiveFriendSessions();
    this.previousSessions = new Map(sessions.map(s => [s.userId, s]));
    return sessions;
  }
}

export const focusSessionPoller = new FocusSessionPoller();
