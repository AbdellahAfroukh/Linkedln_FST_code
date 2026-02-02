import apiClient from '@/lib/api-client';
import {
  CV,
  CVCreate,
  CVUpdate,
  Contact,
  ContactCreate,
  Formation,
  FormationCreate,
  Competence,
  CompetenceCreate,
  Langue,
  LangueCreate,
  Experience,
  ExperienceCreate,
  SuccessResponse,
} from '@/types';

export const cvApi = {
  // CV operations
  create: async (data: CVCreate): Promise<CV> => {
    const response = await apiClient.post('/cv/create', data);
    return response.data;
  },

  get: async (): Promise<CV> => {
    const response = await apiClient.get('/cv/');
    return response.data;
  },

  update: async (data: CVUpdate): Promise<CV> => {
    const response = await apiClient.patch('/cv/update', data);
    return response.data;
  },

  setPublic: async (isPublic: boolean): Promise<{ isPublic: boolean }> => {
    const response = await apiClient.post(`/cv/set-public?is_public=${isPublic}`);
    return response.data;
  },

  enable: async (): Promise<CV> => {
    const response = await apiClient.post('/cv/enable');
    return response.data;
  },

  disable: async (): Promise<CV> => {
    const response = await apiClient.post('/cv/disable');
    return response.data;
  },

  // Contact operations
  addContact: async (data: ContactCreate): Promise<Contact> => {
    const response = await apiClient.post('/cv/contact', data);
    return response.data;
  },

  listContacts: async (): Promise<Contact[]> => {
    const response = await apiClient.get('/cv/contact');
    return response.data;
  },

  updateContact: async (id: number, data: Partial<ContactCreate>): Promise<Contact> => {
    const response = await apiClient.patch(`/cv/contact/${id}`, data);
    return response.data;
  },

  // Formation operations
  addFormation: async (data: FormationCreate): Promise<Formation> => {
    const response = await apiClient.post('/cv/formation', data);
    return response.data;
  },

  listFormations: async (): Promise<Formation[]> => {
    const response = await apiClient.get('/cv/formations');
    return response.data;
  },

  updateFormation: async (id: number, data: Partial<FormationCreate>): Promise<Formation> => {
    const response = await apiClient.patch(`/cv/formation/${id}`, data);
    return response.data;
  },

  // Competence operations
  addCompetence: async (data: CompetenceCreate): Promise<Competence> => {
    const response = await apiClient.post('/cv/competence', data);
    return response.data;
  },

  listCompetences: async (): Promise<Competence[]> => {
    const response = await apiClient.get('/cv/competences');
    return response.data;
  },

  updateCompetence: async (id: number, data: Partial<CompetenceCreate>): Promise<Competence> => {
    const response = await apiClient.patch(`/cv/competence/${id}`, data);
    return response.data;
  },

  // Langue operations
  addLangue: async (data: LangueCreate): Promise<Langue> => {
    const response = await apiClient.post('/cv/langue', data);
    return response.data;
  },

  listLangues: async (): Promise<Langue[]> => {
    const response = await apiClient.get('/cv/langues');
    return response.data;
  },

  updateLangue: async (id: number, data: Partial<LangueCreate>): Promise<Langue> => {
    const response = await apiClient.patch(`/cv/langue/${id}`, data);
    return response.data;
  },

  // Experience operations
  addExperience: async (data: ExperienceCreate): Promise<Experience> => {
    const response = await apiClient.post('/cv/experience', data);
    return response.data;
  },

  listExperiences: async (): Promise<Experience[]> => {
    const response = await apiClient.get('/cv/experiences');
    return response.data;
  },

  updateExperience: async (id: number, data: Partial<ExperienceCreate>): Promise<Experience> => {
    const response = await apiClient.patch(`/cv/experience/${id}`, data);
    return response.data;
  },
};
