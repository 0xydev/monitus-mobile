import { apiClient } from './client';
import { endpoints } from '@/lib/api-endpoints';
import type {
  ApiSuccessResponse,
  PaginatedSessionsResponse,
  Session,
  SessionStats,
  StartSessionRequest,
} from '@/types/api';

export const sessionService = {
  async getActive(): Promise<Session[]> {
    try {
      // GET /sessions returns {data: {sessions: [], page, limit, total}}
      console.log('[SessionService] Fetching sessions with limit=100...');
      const response = await apiClient.request<ApiSuccessResponse<PaginatedSessionsResponse>>(
        `${endpoints.sessions}?limit=100`
      );
      console.log('[SessionService] Raw response:', JSON.stringify(response));

      const sessions = response?.data?.sessions || [];
      console.log('[SessionService] Sessions array length:', sessions.length);

      // Filter for incomplete sessions
      const incomplete = sessions.filter(s => !s.completed);
      console.log('[SessionService] Incomplete sessions:', incomplete.length, incomplete.map(s => ({ id: s.id, completed: s.completed })));
      return incomplete;
    } catch (error) {
      console.error('[SessionService] Error fetching sessions:', error);
      return [];
    }
  },

  async start(data: StartSessionRequest): Promise<Session> {
    const response = await apiClient.request<ApiSuccessResponse<Session>>(
      endpoints.sessions,
      { method: 'POST', body: data }
    );
    return response.data;
  },

  async complete(sessionId: string): Promise<Session> {
    const response = await apiClient.request<ApiSuccessResponse<Session>>(
      endpoints.completeSession(sessionId),
      { method: 'POST' }
    );
    return response.data;
  },

  async cancel(sessionId: string): Promise<void> {
    await apiClient.request(endpoints.cancelSession(sessionId), {
      method: 'POST',
    });
  },

  async getAll(
    page = 1,
    limit = 20
  ): Promise<PaginatedSessionsResponse> {
    const response = await apiClient.request<
      ApiSuccessResponse<PaginatedSessionsResponse>
    >(`${endpoints.sessions}?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getById(sessionId: string): Promise<Session> {
    const response = await apiClient.request<ApiSuccessResponse<Session>>(
      endpoints.sessionById(sessionId)
    );
    return response.data;
  },

  async getStats(): Promise<SessionStats> {
    const response = await apiClient.request<ApiSuccessResponse<SessionStats>>(
      endpoints.sessionStats
    );
    return response.data;
  },

  async delete(sessionId: string): Promise<void> {
    await apiClient.request(endpoints.sessionById(sessionId), {
      method: 'DELETE',
    });
  },
};
