import { WS_URL } from '@/lib/api-endpoints';
import { tokenStorage, apiClient } from '@/services/api/client';
import { Platform } from 'react-native';
import type {
  WebSocketMessage,
  RoomStatePayload,
  ParticipantJoinedPayload,
  ParticipantLeftPayload,
  SessionCompletedPayload,
} from '@/types/websocket';

type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private roomId: string | null = null;
  private messageHandlers: MessageHandler[] = [];
  private isConnecting = false;
  private hasAttemptedRefresh = false;

  async connect(roomId: string): Promise<void> {
    if (this.isConnecting || (this.ws && this.roomId === roomId)) {
      return;
    }

    this.isConnecting = true;
    this.roomId = roomId;

    // Ensure we have a fresh token before connecting
    const tokenIsFresh = await apiClient.ensureFreshToken();
    if (!tokenIsFresh) {
      this.isConnecting = false;
      throw new Error('Failed to refresh authentication token');
    }

    const token = await tokenStorage.getToken();
    if (!token) {
      this.isConnecting = false;
      throw new Error('No auth token available');
    }

    // Backend expects token as query parameter for all platforms
    const url = `${WS_URL}?room_id=${roomId}&token=${token}`;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        const timeout = setTimeout(() => {
          this.isConnecting = false;
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log('WebSocket connected to room:', roomId);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startPingInterval();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error('WebSocket error:', error);
          this.isConnecting = false;
        };

        this.ws.onclose = (event) => {
          clearTimeout(timeout);
          console.log('WebSocket closed:', event.code, event.reason);
          this.isConnecting = false;
          this.stopPingInterval();

          // If 401 Unauthorized, try token refresh before reconnecting
          if (event.code === 1008 || event.reason?.includes('401') || event.reason?.includes('403')) {
            if (!this.hasAttemptedRefresh) {
              this.hasAttemptedRefresh = true;
              console.log('WebSocket auth failed, refreshing token...');
              apiClient.ensureFreshToken().then((success) => {
                if (success && this.roomId) {
                  console.log('Token refreshed, reconnecting...');
                  this.hasAttemptedRefresh = false;
                  this.connect(this.roomId).catch(console.error);
                } else {
                  console.error('Token refresh failed');
                  this.hasAttemptedRefresh = false;
                }
              });
            } else {
              console.error('Already attempted token refresh, giving up');
              this.hasAttemptedRefresh = false;
            }
          } else {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    // Notify all registered handlers
    for (const handler of this.messageHandlers) {
      handler(message);
    }
  }

  private startPingInterval() {
    // Ping every 54 seconds (server expects within 60s)
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 54000);
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      this.roomId = null;
      return;
    }

    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
    this.reconnectAttempts++;

    console.log(`Attempting reconnect in ${delay}ms...`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.roomId) {
        this.connect(this.roomId).catch(console.error);
      }
    }, delay);
  }

  addMessageHandler(handler: MessageHandler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  send(message: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopPingInterval();
    this.ws?.close();
    this.ws = null;
    this.roomId = null;
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getCurrentRoomId(): string | null {
    return this.roomId;
  }
}

export const wsService = new WebSocketService();
