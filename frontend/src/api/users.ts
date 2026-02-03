import apiClient from '@/lib/api-client';
import { UserListResponse, UserDetailResponse } from '@/types';

export const usersApi = {
  // Search all users (available to all authenticated users)
  search: async (query: string, skip = 0, limit = 20): Promise<UserListResponse> => {
    const response = await apiClient.get('/auth/users/search', {
      params: { q: query, skip, limit },
    });
    return response.data;
  },

  // Get user profile by ID (available to all authenticated users)
  getProfile: async (userId: number): Promise<UserDetailResponse> => {
    const response = await apiClient.get(`/auth/users/${userId}`);
    return response.data;
  },
};
