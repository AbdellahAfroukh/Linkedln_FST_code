import apiClient from "@/lib/api-client";

export interface ScopusIntegration {
  id: number;
  scopusAuthorId: string;
  profileUrl: string;
  lastSynced: string | null;
  userId: number;
}

export interface ScopusPublication {
  id: number;
  title: string;
  abstract: string | null;
  summary: string | null;
  publicationDate: string | null;
  citationCount: number;
  scopusUrl: string | null;
  isPosted: boolean;
  scopusIntegrationId: number;
}

export interface ScopusPublicationListResponse {
  total: number;
  publications: ScopusPublication[];
}

export interface SyncScopusPublicationsResponse {
  success: boolean;
  message: string;
  newPublications: number;
  updatedPublications: number;
  totalPublications: number;
}

export const scopusApi = {
  link: async (data: { scopusAuthorId: string }): Promise<ScopusIntegration> => {
    const response = await apiClient.post("/scopus/link", data);
    return response.data;
  },

  update: async (data: { scopusAuthorId: string }): Promise<ScopusIntegration> => {
    const response = await apiClient.put("/scopus/update", data);
    return response.data;
  },

  getIntegration: async (): Promise<ScopusIntegration> => {
    const response = await apiClient.get("/scopus/integration");
    return response.data;
  },

  sync: async (): Promise<SyncScopusPublicationsResponse> => {
    const response = await apiClient.post("/scopus/sync");
    return response.data;
  },

  getPublications: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<ScopusPublicationListResponse> => {
    const response = await apiClient.get("/scopus/publications", { params });
    return response.data;
  },

  getPublication: async (id: number): Promise<ScopusPublication> => {
    const response = await apiClient.get(`/scopus/publications/${id}`);
    return response.data;
  },

  togglePublicationPosted: async (
    id: number,
    isPosted: boolean
  ): Promise<ScopusPublication> => {
    const response = await apiClient.patch(
      `/scopus/publications/${id}/toggle-post`,
      null,
      {
        params: { is_posted: isPosted },
      }
    );
    return response.data;
  },

  unlink: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete("/scopus/unlink");
    return response.data;
  },
};
