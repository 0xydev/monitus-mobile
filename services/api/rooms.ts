import { apiClient } from './client';
import { endpoints } from '@/lib/api-endpoints';
import type {
  ApiSuccessResponse,
  Room,
  CreateRoomRequest,
  JoinRoomRequest,
  UpdateRoomStateRequest,
  RoomParticipant,
  RoomState,
} from '@/types/api';

export const roomService = {
  async create(data: CreateRoomRequest): Promise<Room> {
    const response = await apiClient.request<ApiSuccessResponse<Room>>(
      endpoints.rooms,
      { method: 'POST', body: data }
    );
    return response.data;
  },

  async join(roomCode: string): Promise<Room> {
    const response = await apiClient.request<ApiSuccessResponse<Room>>(
      endpoints.joinRoom,
      {
        method: 'POST',
        body: { room_code: roomCode } as JoinRoomRequest,
      }
    );
    return response.data;
  },

  async getActive(): Promise<Room[]> {
    const response = await apiClient.request<ApiSuccessResponse<Room[]>>(
      endpoints.activeRooms
    );
    return response.data;
  },

  async getMy(): Promise<Room[]> {
    const response = await apiClient.request<ApiSuccessResponse<Room[]>>(
      endpoints.myRooms
    );
    return response.data;
  },

  async getById(roomId: string): Promise<Room> {
    const response = await apiClient.request<ApiSuccessResponse<Room>>(
      endpoints.roomById(roomId)
    );
    return response.data;
  },

  async getParticipants(roomId: string): Promise<RoomParticipant[]> {
    const response = await apiClient.request<
      ApiSuccessResponse<RoomParticipant[]>
    >(endpoints.roomParticipants(roomId));
    return response.data;
  },

  async updateState(roomId: string, state: RoomState): Promise<Room> {
    const response = await apiClient.request<ApiSuccessResponse<Room>>(
      endpoints.roomState(roomId),
      {
        method: 'PUT',
        body: { state } as UpdateRoomStateRequest,
      }
    );
    return response.data;
  },

  async leave(roomId: string): Promise<void> {
    await apiClient.request(endpoints.leaveRoom(roomId), {
      method: 'POST',
    });
  },

  async kick(roomId: string, userId: number): Promise<void> {
    await apiClient.request(endpoints.kickParticipant(roomId, userId), {
      method: 'POST',
    });
  },

  async delete(roomId: string): Promise<void> {
    await apiClient.request(endpoints.roomById(roomId), {
      method: 'DELETE',
    });
  },
};
