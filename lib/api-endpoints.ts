// API Configuration
// Production URL - deployed backend
export const API_BASE_URL = 'https://api.monitus.io';
export const WS_URL = 'wss://api.monitus.io/ws';

// For local development, uncomment these:
// export const API_BASE_URL = 'http://localhost:9999';
// export const WS_URL = 'ws://localhost:9999/ws';

export const endpoints = {
  // Auth
  register: '/auth/register',
  login: '/auth/login',
  me: '/auth/me',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  changePassword: '/auth/password',
  updateFcmToken: '/auth/fcm-token',
  deleteAccount: '/auth/account',
  restoreAccount: '/auth/account/restore',

  // Sessions
  sessions: '/sessions',
  sessionById: (id: string) => `/sessions/${id}`,
  completeSession: (id: string) => `/sessions/${id}/complete`,
  cancelSession: (id: string) => `/sessions/${id}/cancel`,
  sessionStats: '/sessions/stats',

  // Tags
  tags: '/tags',
  tagById: (id: string) => `/tags/${id}`,

  // Rooms
  rooms: '/rooms',
  joinRoom: '/rooms/join',
  activeRooms: '/rooms/active',
  myRooms: '/rooms/my',
  roomById: (id: string) => `/rooms/${id}`,
  roomParticipants: (id: string) => `/rooms/${id}/participants`,
  leaveRoom: (id: string) => `/rooms/${id}/leave`,
  roomState: (id: string) => `/rooms/${id}/state`,
  kickParticipant: (roomId: string, userId: number) =>
    `/rooms/${roomId}/kick/${userId}`,

  // Friendships
  sendFriendRequest: '/friendships/send',
  friends: '/friendships/friends',
  pendingRequests: '/friendships/pending',
  sentRequests: '/friendships/sent',
  acceptFriendship: (id: number) => `/friendships/${id}/accept`,
  rejectFriendship: (id: number) => `/friendships/${id}/reject`,
  removeFriend: (id: number) => `/friendships/${id}`,

  // Achievements
  achievementDefinitions: '/achievements/definitions',
  userAchievements: '/achievements',
  checkAchievements: '/achievements/check',

  // Leaderboards
  globalLeaderboard: '/leaderboards/global',
  levelLeaderboard: '/leaderboards/level',
  streakLeaderboard: '/leaderboards/streak',
  friendsLeaderboard: '/leaderboards/friends',

  // Users
  users: '/users',
  searchUsers: '/users/search',
  userById: (id: number) => `/users/${id}`,

  // Health
  health: '/health',
} as const;
