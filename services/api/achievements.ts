import { apiClient } from './client';
import { endpoints } from '@/lib/api-endpoints';
import type {
  ApiSuccessResponse,
  AchievementDefinition,
  UserAchievement,
} from '@/types/api';

export const achievementService = {
  async getDefinitions(): Promise<Record<string, AchievementDefinition>> {
    const response = await apiClient.request<
      ApiSuccessResponse<Record<string, AchievementDefinition>>
    >(endpoints.achievementDefinitions, { skipAuth: true });
    return response.data;
  },

  async getUserAchievements(): Promise<UserAchievement[]> {
    const response = await apiClient.request<
      ApiSuccessResponse<UserAchievement[]>
    >(endpoints.userAchievements);
    return response.data;
  },

  async checkAchievements(): Promise<string[]> {
    const response = await apiClient.request<ApiSuccessResponse<string[]>>(
      endpoints.checkAchievements,
      { method: 'POST' }
    );
    return response.data;
  },
};
