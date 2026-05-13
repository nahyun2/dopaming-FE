import { router } from 'expo-router';
import { tokenStore } from './token';

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://13.209.66.83:8082'
).replace(/\/$/, '');

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

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

type AccountDeleteResult = 'deleted' | 'signedOutOnly';

function parseApiResponse<T>(text: string): ApiResponse<T> | undefined {
  if (!text) return undefined;

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    return undefined;
  }
}

function getFallbackErrorMessage(status: number): string {
  if (status === 401 || status === 403) {
    return '아이디 또는 비밀번호를 확인해주세요.';
  }

  return `HTTP ${status}`;
}

async function refreshTokens(): Promise<void> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error('리프레시 토큰이 없습니다.');

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const text = await response.text();
  const json = parseApiResponse<AuthTokens>(text);

  if (!response.ok) {
    tokenStore.clear();
    router.replace('/login');
    throw new Error(json?.message ?? '인증 세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  if (!json?.data) {
    throw new Error('토큰 응답을 확인할 수 없습니다.');
  }

  const tokens = json.data;
  tokenStore.set(tokens.accessToken, tokens.refreshToken, tokens.nickname);
}

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
  if (accessToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !isRetry && tokenStore.getRefresh()) {
    await refreshTokens();
    return request<T>(path, options, true);
  }

  const text = await response.text();
  const json = parseApiResponse<T>(text);

  if (!response.ok) {
    throw new Error(json?.message ?? getFallbackErrorMessage(response.status));
  }

  return json?.data ?? (json as unknown as T);
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthTokens> {
    const tokens = await request<AuthTokens>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ ...data, loginId: data.loginId.trim() }),
    });
    tokenStore.set(tokens.accessToken, tokens.refreshToken, tokens.nickname);
    return tokens;
  },

  async signup(data: SignupRequest): Promise<void> {
    await request<unknown>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ ...data, loginId: data.loginId.trim() }),
    });
  },

  async checkId(loginId: string): Promise<{ isAvailable: boolean; message: string }> {
    try {
      await request<{ isAvailable: boolean }>(
        `/api/auth/check-id?loginId=${encodeURIComponent(loginId.trim())}`
      );
      return { isAvailable: true, message: '사용 가능한 아이디입니다.' };
    } catch (e) {
      const message = e instanceof Error ? e.message : '확인에 실패했습니다.';
      return { isAvailable: false, message };
    }
  },

  async logout(): Promise<void> {
    await request<void>('/api/auth/logout', { method: 'POST' });
    tokenStore.clear();
  },

  async deleteAccount(): Promise<AccountDeleteResult> {
    const deletePaths = [
      '/api/auth/delete',
      '/api/auth/withdraw',
      '/api/auth/me',
      '/api/users/me',
      '/api/user/me',
      '/api/members/me',
      '/api/member/me',
    ];
    for (const path of deletePaths) {
      try {
        await request<void>(path, { method: 'DELETE' });
        tokenStore.clear();
        return 'deleted';
      } catch (error) {
        const message = error instanceof Error ? error.message : '';

        if (
          !message.startsWith('HTTP 404') &&
          !message.startsWith('HTTP 405') &&
          message !== '아이디 또는 비밀번호를 확인해주세요.'
        ) {
          throw error;
        }
      }
    }

    try {
      await this.logout();
    } catch {
      tokenStore.clear();
    }

    return 'signedOutOnly';
  },

  refresh: refreshTokens,
};
