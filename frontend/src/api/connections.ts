import apiClient from '@/lib/api-client';
import {
  Connection,
  ConnectionCreate,
  SuccessResponse,
} from '@/types';

export const connectionsApi = {
  send: async (data: ConnectionCreate): Promise<Connection> => {
    const response = await apiClient.post('/connections/send', data);
    return response.data;
  },

  accept: async (id: number): Promise<Connection> => {
    const response = await apiClient.post(`/connections/${id}/accept`);
    return response.data;
  },

  reject: async (id: number): Promise<Connection> => {
    const response = await apiClient.post(`/connections/${id}/reject`);
    return response.data;
  },

  listAccepted: async (): Promise<Connection[]> => {
    const response = await apiClient.get('/connections/accepted');
    return response.data;
  },

  listPendingIncoming: async (): Promise<Connection[]> => {
    const response = await apiClient.get('/connections/pending/incoming');
    return response.data;
  },

  listPendingOutgoing: async (): Promise<Connection[]> => {
    const response = await apiClient.get('/connections/pending/outgoing');
    return response.data;
  },

  delete: async (id: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/connections/${id}`);
    return response.data;
  },

  getMutual: async (userId: number): Promise<Connection[]> => {
    const response = await apiClient.get(`/connections/${userId}/mutual`);
    return response.data;
  },
};
