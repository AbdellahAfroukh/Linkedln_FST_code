export interface User {
  id: number;
  email: string;
  fullName: string;
  user_type: 'enseignant' | 'doctorant' | 'admin';
  profile_completed: boolean;
  otp_configured: boolean;
}

export const saveAuth = (accessToken: string, refreshToken: string, user: User) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getAccessToken = () => localStorage.getItem('access_token');

export const clearAuth = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export const roleRedirectPath = (user: User): string => {
  switch (user.user_type) {
    case 'admin':
      return '/admin';
    case 'enseignant':
      return '/enseignant';
    case 'doctorant':
      return '/doctorant';
    default:
      return '/';
  }
};
