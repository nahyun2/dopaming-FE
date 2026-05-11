const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface SignupRequest {
  userId: string;
  password: string;
  nickname: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const authService = {
  login: (data: LoginRequest) =>
    request<AuthTokens>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  signup: (data: SignupRequest) =>
    request<void>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  checkId: (userId: string) =>
    request<{ exists: boolean }>(
      `/api/auth/check-id?userId=${encodeURIComponent(userId)}`
    ),

  logout: (accessToken: string) =>
    request<void>('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  refresh: (refreshToken: string) =>
    request<AuthTokens>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};
