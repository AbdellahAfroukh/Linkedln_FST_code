import apiClient from '@/lib/api-client';
import {
  Chat,
  ChatDetail,
  Message,
  MessageCreateRequest,
  CreateGroupChatRequest,
  AddMembersRequest,
} from '@/types';

export const chatsApi = {
  // Direct message operations
  sendMessage: async (
    receiverId: number,
    content: string,
    attachment?: string,
  ): Promise<Message> => {
    const request: MessageCreateRequest = { content, receiverId, attachment };
    const response = await apiClient.post('/chats/message', request);
    return response.data;
  },

  // Chat retrieval operations
  list: async (): Promise<Chat[]> => {
    const response = await apiClient.get('/chats');
    return response.data;
  },

  get: async (id: number): Promise<ChatDetail> => {
    const response = await apiClient.get(`/chats/${id}`);
    return response.data;
  },

  getMessages: async (id: number): Promise<Message[]> => {
    const response = await apiClient.get(`/chats/${id}/messages`);
    return response.data;
  },

  // Direct chat operations
  getOrCreateWithUser: async (userId: number): Promise<Chat> => {
    const response = await apiClient.post(`/chats/with/${userId}`);
    return response.data;
  },

  // Group chat operations
  createGroupChat: async (request: CreateGroupChatRequest): Promise<Chat> => {
    const response = await apiClient.post('/chats/group/create', request);
    return response.data;
  },

  addMembers: async (chatId: number, memberIds: number[]): Promise<Chat> => {
    const request: AddMembersRequest = { member_ids: memberIds };
    const response = await apiClient.post(`/chats/${chatId}/add-members`, request);
    return response.data;
  },

  // Delete operations
  deleteMessage: async (messageId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/chats/messages/${messageId}`);
    return response.data;
  },

  markChatAsRead: async (chatId: number): Promise<{ message: string }> => {
    const response = await apiClient.post(`/chats/${chatId}/mark-as-read`);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/chats/${id}`);
    return response.data;
  },
};
