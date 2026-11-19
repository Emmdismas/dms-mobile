import { apiClient } from './client';
import { AuthUser } from '../types';

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  async login(login: string, password: string): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>('/auth/login', {
      login: login.trim(),
      password,
      device_name: 'DMS Mobile App',
    });

    await apiClient.setToken(res.token);
    return res;
  },

  async me(): Promise<AuthUser> {
    const res = await apiClient.get<{ user: AuthUser }>('/auth/me');
    return res.user;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    } finally {
      await apiClient.clearToken();
    }
  },
};
