import apiClient from '@/lib/api-client';
import {
  Chat,
  ChatDetailResponse,
  Message,
  MessageCreate,
  SuccessResponse,
} from '@/types';

export const chatsApi = {
  sendMessage: async (data: MessageCreate): Promise<Message> => {
    const response = await apiClient.post('/chats/message', data);
    return response.data;
  },

  list: async (): Promise<Chat[]> => {
    const response = await apiClient.get('/chats');
    return response.data;
  },

  get: async (id: number): Promise<ChatDetailResponse> => {
    const response = await apiClient.get(`/chats/${id}`);
    return response.data;
  },

  getMessages: async (id: number): Promise<Message[]> => {
    const response = await apiClient.get(`/chats/${id}/messages`);
    return response.data;
  },

  getOrCreateWithUser: async (userId: number): Promise<Chat> => {
    const response = await apiClient.post(`/chats/with/${userId}`);
    return response.data;
  },

  delete: async (id: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/chats/${id}`);
    return response.data;
  },
};
