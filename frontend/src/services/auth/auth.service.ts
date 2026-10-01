import { apiClient } from '@/libs/api/api-client';
import { sessionManager } from '@/libs/api/session-storage';
import { LoginRequest, LoginResponse, UserProfile } from '@/types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    if (response.accessToken) {
      sessionManager.setToken(response.accessToken);
      sessionManager.setUser(response.user);
    }
    return response;
  },

  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/auth/profile');
  },

  logout(): void {
    sessionManager.clear();
  },

  getCurrentUser(): UserProfile | null {
    return sessionManager.getUser();
  },

  isAuthenticated(): boolean {
    return sessionManager.isAuthenticated();
  },
};

