import { apiClient } from './client';
import { endpoints } from '@/lib/api-endpoints';
import type { ApiSuccessResponse, UserSearchResult } from '@/types/api';

export const userService = {
  async search(query: string): Promise<UserSearchResult[]> {
    const response = await apiClient.request<
      ApiSuccessResponse<UserSearchResult[]>
    >(`${endpoints.searchUsers}?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};
