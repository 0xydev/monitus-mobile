import { apiClient } from './client';
import { endpoints } from '@/lib/api-endpoints';
import type { ApiSuccessResponse, Tag, CreateTagRequest } from '@/types/api';

export const tagService = {
  async create(data: CreateTagRequest): Promise<Tag> {
    const response = await apiClient.request<ApiSuccessResponse<Tag>>(
      endpoints.tags,
      { method: 'POST', body: data }
    );
    return response.data;
  },

  async getAll(): Promise<Tag[]> {
    const response = await apiClient.request<ApiSuccessResponse<Tag[]>>(
      endpoints.tags
    );
    return response.data;
  },

  async update(tagId: string, data: CreateTagRequest): Promise<Tag> {
    const response = await apiClient.request<ApiSuccessResponse<Tag>>(
      endpoints.tagById(tagId),
      { method: 'PUT', body: data }
    );
    return response.data;
  },

  async delete(tagId: string): Promise<void> {
    await apiClient.request(endpoints.tagById(tagId), {
      method: 'DELETE',
    });
  },
};
