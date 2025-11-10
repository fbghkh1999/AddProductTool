export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('basalam_token');
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('basalam_refresh_token');
};

export const setTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('basalam_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('basalam_refresh_token', refreshToken);
  }
};

export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('basalam_token');
  localStorage.removeItem('basalam_refresh_token');
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};
