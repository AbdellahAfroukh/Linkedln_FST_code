import apiClient from '@/lib/api-client';
import {
  GoogleScholarIntegration,
  GoogleScholarLink,
  Publication,
  PublicationListResponse,
  SyncPublicationsResponse,
  SuccessResponse,
} from '@/types';

export const googleScholarApi = {
  link: async (data: GoogleScholarLink): Promise<GoogleScholarIntegration> => {
    const response = await apiClient.post('/google-scholar/link', data);
    return response.data;
  },

  update: async (data: GoogleScholarLink): Promise<GoogleScholarIntegration> => {
    const response = await apiClient.put('/google-scholar/update', data);
    return response.data;
  },

  getIntegration: async (): Promise<GoogleScholarIntegration> => {
    const response = await apiClient.get('/google-scholar/integration');
    return response.data;
  },

  sync: async (): Promise<SyncPublicationsResponse> => {
    const response = await apiClient.post('/google-scholar/sync');
    return response.data;
  },

  getPublications: async (params?: { skip?: number; limit?: number }): Promise<PublicationListResponse> => {
    const response = await apiClient.get('/google-scholar/publications', { params });
    return response.data;
  },

  getPublication: async (id: number): Promise<Publication> => {
    const response = await apiClient.get(`/google-scholar/publications/${id}`);
    return response.data;
  },

  togglePublicationPosted: async (id: number, isPosted: boolean): Promise<Publication> => {
    const response = await apiClient.patch(`/google-scholar/publications/${id}/toggle-post`, null, {
      params: { is_posted: isPosted },
    });
    return response.data;
  },

  unlink: async (): Promise<SuccessResponse> => {
    const response = await apiClient.delete('/google-scholar/unlink');
    return response.data;
  },
};
