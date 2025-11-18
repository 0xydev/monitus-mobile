import { WS_URL } from '@/lib/api-endpoints';
import { tokenStorage, apiClient } from '@/services/api/client';
import type { WebSocketMessage } from '@/types/websocket';

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
  private isManuallyDisconnected = false;

  async connect(roomId: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN && this.roomId === roomId) {
      return;
    }

    this.isConnecting = true;
    this.isManuallyDisconnected = false;
    this.roomId = roomId;

    // 1. Ensure fresh token
    try {
      const tokenIsFresh = await apiClient.ensureFreshToken();
      if (!tokenIsFresh) throw new Error('Failed to refresh authentication token');
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }

    // 2. Attempt connection with retry logic for 401s
    return this.establishConnection(roomId);
  }

  private async establishConnection(roomId: string, isRetry = false): Promise<void> {
    const token = await tokenStorage.getToken();
    if (!token) throw new Error('No auth token available');

    // Debug log: Show token tail to verify if it changes on retry
    const tokenTail = token.slice(-10);
    console.log(`Establishing WS connection (Retry: ${isRetry}). Token tail: ...${tokenTail}`);

    // Use Authorization header instead of query param
    const url = `${WS_URL}?room_id=${roomId}`;

    return new Promise((resolve, reject) => {
      try {
        // Close existing if any
        if (this.ws) {
          this.ws.onclose = null; // Prevent triggering old handlers
          this.ws.close();
        }

        // Pass token in headers (React Native specific)
        // @ts-ignore - React Native WebSocket supports 3rd argument for options
        this.ws = new WebSocket(url, null, {
          headers: {
            Authorization: `Bearer ${token}`,
            Origin: 'https://app.monitus.io',
          },
        });

        const timeout = setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            reject(new Error('WebSocket connection timeout'));
          }
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
          // Suppress error log if we are connecting (likely 401 which onclose will handle)
          if (!this.isConnecting) {
             console.error('WebSocket error:', error);
          }
        };

        this.ws.onclose = async (event) => {
          clearTimeout(timeout);
          this.stopPingInterval();

          console.log(`WebSocket closed. Code: ${event.code}, Reason: "${event.reason}"`);

          // Handle Auth Failure (401/403)
          // 1008 = Policy Violation (often used for auth failure)
          if (event.code === 1008 || event.reason?.includes('401') || event.reason?.includes('403')) {
            if (!isRetry) {
              console.log('WebSocket auth failed, forcing token refresh...');
              try {
                // Force a refresh because the current token might be valid for HTTP but rejected by WS
                const success = await apiClient.forceTokenRefresh();
                if (success) {
                  console.log('Token refresh successful, retrying connection...');
                  // Recursive retry, but await it to resolve the ORIGINAL promise
                  await this.establishConnection(roomId, true);
                  resolve(); // Resolve original promise on success
                  return;
                }
              } catch (e) {
                console.error('Token refresh failed during WS connect:', e);
              }
            } else {
              console.error('Retry connection also failed. Giving up.');
            }
            // If retry failed or already retried
            this.isConnecting = false;
            reject(new Error(`Authentication failed (Code: ${event.code}, Reason: ${event.reason})`));
          } else {
            // Normal close or other error
            if (this.isConnecting) {
              this.isConnecting = false;
              reject(new Error(`WebSocket closed with code ${event.code}`));
            } else if (!this.isManuallyDisconnected) {
              console.log('WebSocket closed unexpectedly, reconnecting...');
              this.attemptReconnect();
            }
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    for (const handler of this.messageHandlers) {
      handler(message);
    }
  }

  private startPingInterval() {
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

    const delay = Math.pow(2, this.reconnectAttempts) * 1000;
    this.reconnectAttempts++;

    console.log(`Attempting reconnect in ${delay}ms...`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.roomId && !this.isManuallyDisconnected) {
        this.establishConnection(this.roomId).catch(console.error);
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
    this.isManuallyDisconnected = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopPingInterval();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }
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
