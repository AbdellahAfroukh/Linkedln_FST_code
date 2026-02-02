import apiClient, { setTokens, clearTokens } from '@/lib/api-client';
import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  Token2FAResponse,
  ProfileCompleteRequest,
  OTPSetupResponse,
  OTPVerifyRequest,
  RefreshTokenRequest,
  Disable2FARequest,
  User,
} from '@/types';

export const authApi = {
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<Token2FAResponse> => {
    const response = await apiClient.post('/auth/login', data);
    const result = response.data;
    
    if (!result.requires_2fa && result.access_token) {
      setTokens(result.access_token, result.refresh_token);
    }
    
    return result;
  },

  completeProfile: async (data: ProfileCompleteRequest): Promise<User> => {
    const response = await apiClient.post('/auth/complete-profile', data);
    return response.data;
  },

  setup2FA: async (): Promise<OTPSetupResponse> => {
    const response = await apiClient.post('/auth/setup-2fa');
    return response.data;
  },

  enable2FA: async (data: OTPVerifyRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/enable-2fa', data);
    return response.data;
  },

  verify2FA: async (data: OTPVerifyRequest): Promise<TokenResponse> => {
    const response = await apiClient.post('/auth/verify-2fa', data);
    const result = response.data;
    
    if (result.access_token) {
      setTokens(result.access_token, result.refresh_token);
    }
    
    return result;
  },

  disable2FA: async (data: Disable2FARequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/disable-2fa', data);
    return response.data;
  },

  refresh: async (data: RefreshTokenRequest): Promise<TokenResponse> => {
    const response = await apiClient.post('/auth/refresh', data);
    const result = response.data;
    
    if (result.access_token) {
      setTokens(result.access_token, result.refresh_token);
    }
    
    return result;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/logout');
    clearTokens();
    return response.data;
  },
};

// Organization endpoints for profile completion (public for authenticated users)
export const organizationsApi = {
  getUniversities: async () => {
    const response = await apiClient.get('/auth/organizations/universities');
    return response.data;
  },
  
  getEtablissements: async () => {
    const response = await apiClient.get('/auth/organizations/etablissements');
    return response.data;
  },
  
  getDepartements: async () => {
    const response = await apiClient.get('/auth/organizations/departements');
    return response.data;
  },
  
  getLaboratoires: async () => {
    const response = await apiClient.get('/auth/organizations/laboratoires');
    return response.data;
  },
  
  getEquipes: async () => {
    const response = await apiClient.get('/auth/organizations/equipes');
    return response.data;
  },
  
  getSpecialites: async () => {
    const response = await apiClient.get('/auth/organizations/specialites');
    return response.data;
  },
  
  getThematiques: async () => {
    const response = await apiClient.get('/auth/organizations/thematiques');
    return response.data;
  },
};
