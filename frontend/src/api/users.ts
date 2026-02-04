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

  // Filter users by organizational affiliations and user type
  filterUsers: async (
    filters: {
      university_id?: number | null;
      etablissement_id?: number | null;
      departement_id?: number | null;
      laboratoire_id?: number | null;
      equipe_id?: number | null;
      user_type?: string | null;
    },
    skip = 0,
    limit = 50
  ): Promise<UserListResponse> => {
    const params: Record<string, any> = { skip, limit };
    
    if (filters.university_id) params.university_id = filters.university_id;
    if (filters.etablissement_id) params.etablissement_id = filters.etablissement_id;
    if (filters.departement_id) params.departement_id = filters.departement_id;
    if (filters.laboratoire_id) params.laboratoire_id = filters.laboratoire_id;
    if (filters.equipe_id) params.equipe_id = filters.equipe_id;
    if (filters.user_type) params.user_type = filters.user_type;
    
    const response = await apiClient.get('/auth/users/filter', { params });
    return response.data;
  },
};
