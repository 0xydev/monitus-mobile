import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from '@/lib/api-endpoints';
import type { AuthTokenResponse } from '@/types/api';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

// For web platform, use localStorage as fallback
const tokenStorage = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem('jwt_token');
    }
    return SecureStore.getItemAsync('jwt_token');
  },
  async setToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem('jwt_token', token);
    } else {
      await SecureStore.setItemAsync('jwt_token', token);
    }
  },
  async deleteToken(): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem('jwt_token');
    } else {
      await SecureStore.deleteItemAsync('jwt_token');
    }
  },
};

export { tokenStorage };

class ApiClient {
  private baseUrl = API_BASE_URL;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  // Public method to force a token refresh
  async forceTokenRefresh(): Promise<boolean> {
    return this.refreshToken();
  }

  // Public method to refresh token (for WebSocket)
  async ensureFreshToken(): Promise<boolean> {
    const token = await tokenStorage.getToken();
    if (!token) return false;

    // Try to verify token by calling /auth/me
    // If it fails with 401, it will automatically refresh
    try {
      await this.request('/auth/me');
      return true;
    } catch (error) {
      // If still failing after refresh attempt, return false
      return false;
    }
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, skipAuth = false } = config;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add auth token
    if (!skipAuth) {
      const token = await tokenStorage.getToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle 401 - Token expired
    if (response.status === 401 && !skipAuth) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry request with new token
        return this.request(endpoint, config);
      }
      // Token refresh failed, clear token
      await tokenStorage.deleteToken();
      throw new Error('Session expired. Please login again.');
    }

    // Handle rate limiting
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('API Error:', {
        endpoint,
        status: response.status,
        error,
      });
      throw new Error(
        error.error || error.message || `Request failed with status ${response.status}`
      );
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefreshToken();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async doRefreshToken(): Promise<boolean> {
    try {
      const token = await tokenStorage.getToken();
      if (!token) return false;

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = (await response.json()) as AuthTokenResponse;
        await tokenStorage.setToken(data.token.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
