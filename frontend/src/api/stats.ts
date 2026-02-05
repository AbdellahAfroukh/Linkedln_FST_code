import apiClient from '@/lib/api-client';

export interface PlatformStats {
  users: {
    total: number;
    enseignants: number;
    doctorants: number;
    admins: number;
  };
  content: {
    posts: number;
    comments: number;
    projets: number;
  };
  organisation: {
    universities: number;
    etablissements: number;
    laboratoires: number;
  };
}

export const statsApi = {
  getPlatformStats: async (): Promise<PlatformStats> => {
    const response = await apiClient.get('/auth/platform-stats');
    return response.data;
  },
};
