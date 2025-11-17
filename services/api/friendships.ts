import { apiClient } from './client';
import { endpoints } from '@/lib/api-endpoints';
import type {
  ApiSuccessResponse,
  Friend,
  Friendship,
  SendFriendRequestRequest,
} from '@/types/api';

export const friendshipService = {
  async sendRequest(addresseeId: number): Promise<Friendship> {
    const response = await apiClient.request<ApiSuccessResponse<Friendship>>(
      endpoints.sendFriendRequest,
      {
        method: 'POST',
        body: { addressee_id: addresseeId } as SendFriendRequestRequest,
      }
    );
    return response.data;
  },

  async getFriends(): Promise<Friend[]> {
    const response = await apiClient.request<ApiSuccessResponse<Friend[]>>(
      endpoints.friends
    );
    return response.data;
  },

  async getPendingRequests(): Promise<Friendship[]> {
    const response = await apiClient.request<ApiSuccessResponse<Friendship[]>>(
      endpoints.pendingRequests
    );
    return response.data;
  },

  async getSentRequests(): Promise<Friendship[]> {
    const response = await apiClient.request<ApiSuccessResponse<Friendship[]>>(
      endpoints.sentRequests
    );
    return response.data;
  },

  async acceptRequest(friendshipId: number): Promise<Friendship> {
    const response = await apiClient.request<ApiSuccessResponse<Friendship>>(
      endpoints.acceptFriendship(friendshipId),
      { method: 'POST' }
    );
    return response.data;
  },

  async rejectRequest(friendshipId: number): Promise<void> {
    await apiClient.request(endpoints.rejectFriendship(friendshipId), {
      method: 'POST',
    });
  },

  async removeFriend(friendshipId: number): Promise<void> {
    await apiClient.request(endpoints.removeFriend(friendshipId), {
      method: 'DELETE',
    });
  },
};
