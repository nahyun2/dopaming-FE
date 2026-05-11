import { tokenStore } from './token';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

// ── 요청/응답 타입 (백엔드 DTO와 일치) ──────────────────────────────
export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface SignupRequest {
  loginId: string;
  password: string;
  name: string;
  nickname: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  nickname?: string;
}

// 백엔드 공통 응답: { status, message, data }
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// ── 공통 fetch 헬퍼 ────────────────────────────────────────────────
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  const accessToken = tokenStore.getAccess();
  if (accessToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const json: ApiResponse<T> = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new Error(json?.message ?? `HTTP ${response.status}`);
  }

  return json?.data ?? (json as unknown as T);
}

// ── Auth API ───────────────────────────────────────────────────────
export const authService = {
  async login(data: LoginRequest): Promise<AuthTokens> {
    const tokens = await request<AuthTokens>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    tokenStore.set(tokens.accessToken, tokens.refreshToken, tokens.nickname);
    return tokens;
  },

  async signup(data: SignupRequest): Promise<void> {
    await request<unknown>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async checkId(loginId: string): Promise<boolean> {
    const result = await request<{ isAvailable: boolean }>(
      `/api/auth/check-id?loginId=${encodeURIComponent(loginId)}`
    );
    return result.isAvailable;
  },

  async logout(): Promise<void> {
    await request<void>('/api/auth/logout', { method: 'POST' });
    tokenStore.clear();
  },

  async refresh(): Promise<AuthTokens> {
    const refreshToken = tokenStore.getRefresh();
    if (!refreshToken) throw new Error('No refresh token');
    const tokens = await request<AuthTokens>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    tokenStore.set(tokens.accessToken, tokens.refreshToken, tokens.nickname);
    return tokens;
  },
};
