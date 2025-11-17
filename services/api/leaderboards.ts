import { apiClient } from './client';
import { endpoints } from '@/lib/api-endpoints';
import type { ApiSuccessResponse, LeaderboardEntry } from '@/types/api';

export const leaderboardService = {
  async getGlobal(limit = 10): Promise<LeaderboardEntry[]> {
    const response = await apiClient.request<
      ApiSuccessResponse<LeaderboardEntry[]>
    >(`${endpoints.globalLeaderboard}?limit=${limit}`, { skipAuth: true });
    return response.data;
  },

  async getByLevel(limit = 10): Promise<LeaderboardEntry[]> {
    const response = await apiClient.request<
      ApiSuccessResponse<LeaderboardEntry[]>
    >(`${endpoints.levelLeaderboard}?limit=${limit}`, { skipAuth: true });
    return response.data;
  },

  async getByStreak(limit = 10): Promise<LeaderboardEntry[]> {
    const response = await apiClient.request<
      ApiSuccessResponse<LeaderboardEntry[]>
    >(`${endpoints.streakLeaderboard}?limit=${limit}`, { skipAuth: true });
    return response.data;
  },

  async getFriends(): Promise<LeaderboardEntry[]> {
    const response = await apiClient.request<
      ApiSuccessResponse<LeaderboardEntry[]>
    >(endpoints.friendsLeaderboard);
    return response.data;
  },
};
