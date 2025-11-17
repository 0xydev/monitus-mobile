import { apiClient, tokenStorage } from './client';
import { endpoints } from '@/lib/api-endpoints';
import type {
  ApiSuccessResponse,
  AuthTokenResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from '@/types/api';

export const authService = {
  async register(
    data: RegisterRequest
  ): Promise<{ token: string; expired_at: string }> {
    const response = await apiClient.request<AuthTokenResponse>(
      endpoints.register,
      { method: 'POST', body: data, skipAuth: true }
    );
    await tokenStorage.setToken(response.token.token);
    return response.token;
  },

  async login(
    data: LoginRequest
  ): Promise<{ token: string; expired_at: string }> {
    const response = await apiClient.request<AuthTokenResponse>(
      endpoints.login,
      { method: 'PUT', body: data, skipAuth: true }
    );
    await tokenStorage.setToken(response.token.token);
    return response.token;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.request<ApiSuccessResponse<User>>(
      endpoints.me
    );
    return response.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.request<ApiSuccessResponse<User>>(
      endpoints.me,
      {
        method: 'PATCH',
        body: data,
      }
    );
    return response.data;
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await apiClient.request(endpoints.changePassword, {
      method: 'PUT',
      body: { current_password: currentPassword, new_password: newPassword },
    });
  },

  async updateFcmToken(fcmToken: string): Promise<void> {
    await apiClient.request(endpoints.updateFcmToken, {
      method: 'PUT',
      body: { fcm_token: fcmToken },
    });
  },

  async logout(): Promise<void> {
    try {
      await apiClient.request(endpoints.logout);
    } catch {
      // Ignore errors on logout
    }
    await tokenStorage.deleteToken();
  },

  async deleteAccount(): Promise<void> {
    await apiClient.request(endpoints.deleteAccount, {
      method: 'DELETE',
    });
    await tokenStorage.deleteToken();
  },

  async restoreAccount(email: string, password: string): Promise<User> {
    const response = await apiClient.request<ApiSuccessResponse<User>>(
      endpoints.restoreAccount,
      {
        method: 'POST',
        body: { email, password },
        skipAuth: true,
      }
    );
    return response.data;
  },

  async hasToken(): Promise<boolean> {
    const token = await tokenStorage.getToken();
    return !!token;
  },
};
