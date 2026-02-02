import apiClient from '@/lib/api-client';
import {
  University,
  UniversityCreate,
  UniversityUpdate,
  Etablissement,
  EtablissementCreate,
  EtablissementUpdate,
  Departement,
  DepartementCreate,
  DepartementUpdate,
  Laboratoire,
  LaboratoireCreate,
  LaboratoireUpdate,
  Equipe,
  EquipeCreate,
  EquipeUpdate,
  Specialite,
  SpecialiteCreate,
  SpecialiteUpdate,
  ThematiqueDeRecherche,
  ThematiqueDeRechercheCreate,
  ThematiqueDeRechercheUpdate,
  UserListResponse,
  UserDetailResponse,
  UserUpdateByAdmin,
  PlatformStatistics,
  UserType,
  SuccessResponse,
} from '@/types';

// Universities
export const universitiesApi = {
  create: async (data: UniversityCreate): Promise<University> => {
    const response = await apiClient.post('/admin/universities', data);
    return response.data;
  },
  list: async (): Promise<University[]> => {
    const response = await apiClient.get('/admin/universities');
    return response.data;
  },
  get: async (id: number): Promise<University> => {
    const response = await apiClient.get(`/admin/universities/${id}`);
    return response.data;
  },
  update: async (id: number, data: UniversityUpdate): Promise<University> => {
    const response = await apiClient.put(`/admin/universities/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/admin/universities/${id}`);
    return response.data;
  },
};

// Etablissements
export const etablissementsApi = {
  create: async (data: EtablissementCreate): Promise<Etablissement> => {
    const response = await apiClient.post('/admin/etablissements', data);
    return response.data;
  },
  list: async (): Promise<Etablissement[]> => {
    const response = await apiClient.get('/admin/etablissements');
    return response.data;
  },
  get: async (id: number): Promise<Etablissement> => {
    const response = await apiClient.get(`/admin/etablissements/${id}`);
    return response.data;
  },
  update: async (id: number, data: EtablissementUpdate): Promise<Etablissement> => {
    const response = await apiClient.put(`/admin/etablissements/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/admin/etablissements/${id}`);
    return response.data;
  },
};

// Departements
export const departementsApi = {
  create: async (data: DepartementCreate): Promise<Departement> => {
    const response = await apiClient.post('/admin/departements', data);
    return response.data;
  },
  list: async (): Promise<Departement[]> => {
    const response = await apiClient.get('/admin/departements');
    return response.data;
  },
  get: async (id: number): Promise<Departement> => {
    const response = await apiClient.get(`/admin/departements/${id}`);
    return response.data;
  },
  update: async (id: number, data: DepartementUpdate): Promise<Departement> => {
    const response = await apiClient.put(`/admin/departements/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/admin/departements/${id}`);
    return response.data;
  },
};

// Laboratoires
export const laboratoiresApi = {
  create: async (data: LaboratoireCreate): Promise<Laboratoire> => {
    const response = await apiClient.post('/admin/laboratoires', data);
    return response.data;
  },
  list: async (): Promise<Laboratoire[]> => {
    const response = await apiClient.get('/admin/laboratoires');
    return response.data;
  },
  get: async (id: number): Promise<Laboratoire> => {
    const response = await apiClient.get(`/admin/laboratoires/${id}`);
    return response.data;
  },
  update: async (id: number, data: LaboratoireUpdate): Promise<Laboratoire> => {
    const response = await apiClient.put(`/admin/laboratoires/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/admin/laboratoires/${id}`);
    return response.data;
  },
};

// Equipes
export const equipesApi = {
  create: async (data: EquipeCreate): Promise<Equipe> => {
    const response = await apiClient.post('/admin/equipes', data);
    return response.data;
  },
  list: async (): Promise<Equipe[]> => {
    const response = await apiClient.get('/admin/equipes');
    return response.data;
  },
  get: async (id: number): Promise<Equipe> => {
    const response = await apiClient.get(`/admin/equipes/${id}`);
    return response.data;
  },
  update: async (id: number, data: EquipeUpdate): Promise<Equipe> => {
    const response = await apiClient.put(`/admin/equipes/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/admin/equipes/${id}`);
    return response.data;
  },
};

// Specialites
export const specialitesApi = {
  create: async (data: SpecialiteCreate): Promise<Specialite> => {
    const response = await apiClient.post('/admin/specialites', data);
    return response.data;
  },
  list: async (): Promise<Specialite[]> => {
    const response = await apiClient.get('/admin/specialites');
    return response.data;
  },
  get: async (id: number): Promise<Specialite> => {
    const response = await apiClient.get(`/admin/specialites/${id}`);
    return response.data;
  },
  update: async (id: number, data: SpecialiteUpdate): Promise<Specialite> => {
    const response = await apiClient.put(`/admin/specialites/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/admin/specialites/${id}`);
    return response.data;
  },
};

// Thematiques
export const thematiquesApi = {
  create: async (data: ThematiqueDeRechercheCreate): Promise<ThematiqueDeRecherche> => {
    const response = await apiClient.post('/admin/thematiques', data);
    return response.data;
  },
  list: async (): Promise<ThematiqueDeRecherche[]> => {
    const response = await apiClient.get('/admin/thematiques');
    return response.data;
  },
  get: async (id: number): Promise<ThematiqueDeRecherche> => {
    const response = await apiClient.get(`/admin/thematiques/${id}`);
    return response.data;
  },
  update: async (id: number, data: ThematiqueDeRechercheUpdate): Promise<ThematiqueDeRecherche> => {
    const response = await apiClient.put(`/admin/thematiques/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/admin/thematiques/${id}`);
    return response.data;
  },
};

// User Management
export const adminUsersApi = {
  list: async (params?: { skip?: number; limit?: number; user_type?: UserType }): Promise<UserListResponse> => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },
  search: async (q: string, params?: { skip?: number; limit?: number }): Promise<UserListResponse> => {
    const response = await apiClient.get('/admin/users/search', { params: { q, ...params } });
    return response.data;
  },
  get: async (id: number): Promise<UserDetailResponse> => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },
  update: async (id: number, data: UserUpdateByAdmin): Promise<UserDetailResponse> => {
    const response = await apiClient.patch(`/admin/users/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<SuccessResponse> => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },
  toggleActivation: async (id: number, active: boolean): Promise<UserDetailResponse> => {
    const response = await apiClient.patch(`/admin/users/${id}/toggle-activation`, null, { params: { active } });
    return response.data;
  },
};

// Platform Statistics
export const adminStatsApi = {
  get: async (): Promise<PlatformStatistics> => {
    const response = await apiClient.get('/admin/statistics');
    return response.data;
  },
};
