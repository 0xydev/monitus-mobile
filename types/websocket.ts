// WebSocket Message Types

export type WebSocketMessageType =
  | 'room_state'
  | 'participant_joined'
  | 'participant_left'
  | 'session_completed'
  | 'ping'
  | 'pong';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  payload: T;
}

export interface RoomStatePayload {
  state: string;
  timer_started_at: string | null;
}

export interface ParticipantJoinedPayload {
  user_id: number;
  username: string;
}

export interface ParticipantLeftPayload {
  user_id: number;
}

export interface SessionCompletedPayload {
  user_id: number;
  session_id: string;
}
