import api from '../utils/api';
import { AuthUser, User } from '../types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface RefreshResponse {
  access: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login/', credentials);
    return response.data;
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<AuthUser>('/auth/users/me/');
    return response.data;
  },

  async getUsers(): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/auth/users/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to view users.');
      } else {
        throw new Error('Failed to fetch users. Please try again.');
      }
    }
  },

  async createUser(userData: Partial<User>): Promise<User> {
    const response = await api.post<User>('/auth/users/', userData);
    return response.data;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await api.put<User>(`/auth/users/${id}/`, userData);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/auth/users/${id}/`);
  },

  async refreshToken(): Promise<RefreshResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post<RefreshResponse>('/auth/token/refresh/', {
      refresh: refreshToken
    });
    return response.data;
  },
};

