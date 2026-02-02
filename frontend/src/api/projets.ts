import apiClient from '@/lib/api-client';
import {
  Projet,
  ProjetCreate,
  ProjetUpdate,
  ProjetListResponse,
  SuccessResponse,
} from '@/types';

export const projetsApi = {
  create: async (data: ProjetCreate): Promise<Projet> => {
    const response = await apiClient.post('/projets/', data);
    return response.data;
  },

  getMyProjets: async (params?: { skip?: number; limit?: number }): Promise<ProjetListResponse> => {
    const response = await apiClient.get('/projets/my-projets', { params });
    return response.data;
  },

  list: async (params?: { skip?: number; limit?: number; statut?: string }): Promise<ProjetListResponse> => {
    const response = await apiClient.get('/projets/', { params });
    return response.data;
  },

  search: async (q: string, params?: { skip?: number; limit?: number }): Promise<ProjetListResponse> => {
    const response = await apiClient.get('/projets/search', { params: { q, ...params } });
    return response.data;
  },

  getUserProjets: async (userId: number, params?: { skip?: number; limit?: number }): Promise<ProjetListResponse> => {
    const response = await apiClient.get(`/projets/user/${userId}`, { params });
    return response.data;
  },

  get: async (id: number): Promise<Projet> => {
    const response = await apiClient.get(`/projets/${id}`);
    return response.data;
  },

  update: async (id: number, data: ProjetUpdate): Promise<Projet> => {
    const response = await apiClient.patch(`/projets/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/projets/${id}`);
    return response.data;
  },
};
