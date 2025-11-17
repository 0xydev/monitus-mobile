// API Response Types

export interface ApiSuccessResponse<T> {
  message: string;
  data: T;
}

export interface AuthTokenResponse {
  status: 'success';
  message?: string;
  token: {
    token: string;
    expired_at: string;
  };
}

export interface ApiErrorResponse {
  error: string;
}

// User Types
export interface User {
  id: number;
  reference: string;
  username: string;
  email: string;
  avatar_url: string | null;
  timezone: string;
  total_focus_minutes: number;
  current_streak: number;
  longest_streak: number;
  level: number;
  xp: number;
  last_login_at: string | null;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Auth Request Types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  avatar_url?: string;
  timezone?: string;
}

// Session Types
export interface Session {
  id: string;
  user_id: number;
  tag_id: string | null;
  room_id: string | null;
  start_time: string;
  end_time: string | null;
  planned_duration: number;
  actual_duration: number;
  session_type: 'focus' | 'break';
  completed: boolean;
  created_at: string;
}

export interface StartSessionRequest {
  tag_id?: string;
  room_id?: string;
  planned_duration: number;
  session_type: 'focus' | 'break';
}

export interface SessionStats {
  total_focus_minutes: number;
  total_focus_hours: number;
  weekly_sessions: number;
  monthly_sessions: number;
  current_streak: number;
  longest_streak: number;
  level: number;
  xp: number;
}

export interface PaginatedSessionsResponse {
  sessions: Session[];
  total: number;
  page: number;
  limit: number;
}

// Tag Types
export interface Tag {
  id: string;
  user_id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTagRequest {
  name: string;
  color: string;
}

// Room Types
export type RoomState = 'idle' | 'running' | 'paused' | 'break';

export interface Room {
  id: string;
  creator_id: number;
  name: string;
  room_code: string;
  timer_duration: number;
  break_duration: number;
  is_active: boolean;
  current_state: RoomState;
  timer_started_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRoomRequest {
  name: string;
  timer_duration: number;
  break_duration: number;
}

export interface JoinRoomRequest {
  room_code: string;
}

export interface UpdateRoomStateRequest {
  state: RoomState;
}

export interface RoomParticipant {
  id: number;
  username: string;
  avatar_url: string | null;
  joined_at: string;
}

// Friendship Types
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export interface Friendship {
  id: number;
  requester_id: number;
  addressee_id: number;
  status: FriendshipStatus;
  created_at: string;
}

export interface Friend {
  id: number;
  username: string;
  avatar_url: string | null;
  total_focus_minutes: number;
  current_streak: number;
  level: number;
}

export interface SendFriendRequestRequest {
  addressee_id: number;
}

// Achievement Types
export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: string;
  unlocked_at: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  id: number;
  username: string;
  avatar_url: string | null;
  total_focus_minutes?: number;
  level?: number;
  xp?: number;
  current_streak?: number;
}

// User Search
export interface UserSearchResult {
  id: number;
  username: string;
  avatar_url: string | null;
}
