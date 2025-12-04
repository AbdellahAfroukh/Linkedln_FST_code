import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  requires_2fa: boolean;
  user?: {
    id: number;
    email: string;
    fullName: string;
    user_type: string;
    profile_completed: boolean;
    otp_configured: boolean;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  user_type: 'enseignant' | 'doctorant';
}

export const authAPI = {
  register: (data: RegisterData) => 
    api.post<{ id: number; email: string; fullName: string; user_type: string }>('/auth/register', data),
  
  login: (email: string, password: string) => 
    api.post<LoginResponse>('/auth/login', { email, password }),
  
  verify2FA: (email: string, token: string) => 
    api.post<LoginResponse>('/auth/verify-2fa', { email, token }),
  
  me: () => 
    api.get('/auth/me'),
};

export default api;
