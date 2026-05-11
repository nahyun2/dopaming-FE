import { router } from 'expo-router';
import { tokenStore } from './token';

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'https://proponent-ocean-worried.ngrok-free.dev'
).replace(/\/$/, '');

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

// ── 토큰 재발급 (인터셉터 내부용, request()를 거치지 않음) ───────────
async function refreshTokens(): Promise<void> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error('리프레시 토큰이 없습니다.');

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const text = await response.text();
  const json: ApiResponse<AuthTokens> = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    // 400 REFRESH_TOKEN_REQUIRED / 401 REFRESH_TOKEN_EXPIRED
    tokenStore.clear();
    router.replace('/login');
    throw new Error(json?.message ?? '인증 세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  const tokens = json.data;
  tokenStore.set(tokens.accessToken, tokens.refreshToken, tokens.nickname);
}

// ── 공통 fetch 헬퍼 ────────────────────────────────────────────────
export async function request<T>(
  path: string,
  options?: RequestInit,
  isRetry = false,
): Promise<T> {
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

  // 액세스 토큰 만료 → 재발급 후 한 번만 재시도
  if (response.status === 401 && !isRetry && tokenStore.getRefresh()) {
    await refreshTokens();
    return request<T>(path, options, true);
  }

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

  async checkId(loginId: string): Promise<{ isAvailable: boolean; message: string }> {
    try {
      await request<{ isAvailable: boolean }>(
        `/api/auth/check-id?loginId=${encodeURIComponent(loginId)}`
      );
      return { isAvailable: true, message: '사용 가능한 아이디입니다.' };
    } catch (e) {
      // 400 INVALID_ID_FORMAT / 409 DUPLICATE_ID
      const message = e instanceof Error ? e.message : '확인에 실패했습니다.';
      return { isAvailable: false, message };
    }
  },

  async logout(): Promise<void> {
    await request<void>('/api/auth/logout', { method: 'POST' });
    tokenStore.clear();
  },

  // 수동 재발급이 필요한 경우 외부에서 직접 호출 가능
  refresh: refreshTokens,
};
