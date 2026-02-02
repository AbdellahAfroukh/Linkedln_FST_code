import apiClient from '@/lib/api-client';
import {
  PostCreate,
  PostUpdate,
  Post,
  PostListResponse,
  CommentCreate,
  CommentUpdate,
  Comment,
  ReactionCreate,
  Reaction,
  SuccessResponse,
} from '@/types';

export const postsApi = {
  create: async (data: PostCreate): Promise<Post> => {
    const response = await apiClient.post('/posts/', data);
    return response.data;
  },

  getFeed: async (params?: { skip?: number; limit?: number }): Promise<PostListResponse> => {
    const response = await apiClient.get('/posts/feed', { params });
    return response.data;
  },

  getUserPosts: async (userId: number, params?: { skip?: number; limit?: number }): Promise<PostListResponse> => {
    const response = await apiClient.get(`/posts/user/${userId}`, { params });
    return response.data;
  },

  get: async (id: number): Promise<Post> => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  },

  update: async (id: number, data: PostUpdate): Promise<Post> => {
    const response = await apiClient.patch(`/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/posts/${id}`);
    return response.data;
  },

  // Comments
  addComment: async (postId: number, data: CommentCreate): Promise<Comment> => {
    const response = await apiClient.post(`/posts/${postId}/comments`, data);
    return response.data;
  },

  updateComment: async (commentId: number, data: CommentUpdate): Promise<Comment> => {
    const response = await apiClient.patch(`/posts/comments/${commentId}`, data);
    return response.data;
  },

  deleteComment: async (commentId: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/posts/comments/${commentId}`);
    return response.data;
  },

  // Reactions
  reactToPost: async (postId: number, data: ReactionCreate): Promise<Reaction> => {
    const response = await apiClient.post(`/posts/${postId}/reactions`, data);
    return response.data;
  },

  removePostReaction: async (postId: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/posts/${postId}/reactions`);
    return response.data;
  },

  reactToComment: async (commentId: number, data: ReactionCreate): Promise<Reaction> => {
    const response = await apiClient.post(`/posts/comments/${commentId}/reactions`, data);
    return response.data;
  },

  removeCommentReaction: async (commentId: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/posts/comments/${commentId}/reactions`);
    return response.data;
  },

  getPostReactions: async (postId: number): Promise<Reaction[]> => {
    const response = await apiClient.get(`/posts/${postId}/reactions`);
    return response.data;
  },
};
