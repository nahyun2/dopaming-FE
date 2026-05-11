import { request } from './auth';

export type ShortformPlatform = 'YOUTUBE_SHORTS' | 'INSTAGRAM_REELS' | 'TIKTOK' | 'ETC';

export type ShortformUsageStatus = 'AVAILABLE' | 'LIMIT_EXCEEDED';

export interface ShortformUsageRequest {
  platform: ShortformPlatform;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
}

export interface ShortformUsageResult {
  todayUsageSeconds: number;
  dailyLimitSeconds: number;
  extraTimeSeconds: number;
  totalAllowedSeconds: number;
  remainingSeconds: number;
  status: ShortformUsageStatus;
}

export interface TodayShortformUsageResult {
  todayUsageSeconds: number;
  dailyLimitSeconds: number;
  remainingSeconds: number;
  status: ShortformUsageStatus;
}

export interface ShortformLimitResult {
  dailyLimitSeconds: number;
}

export interface ShortformLimitRequest {
  dailyLimitSeconds: number;
}

export const shortformService = {
  recordUsage(data: ShortformUsageRequest): Promise<ShortformUsageResult> {
    return request<ShortformUsageResult>('/api/shortform/usage', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getTodayUsage(): Promise<TodayShortformUsageResult> {
    return request<TodayShortformUsageResult>('/api/shortform/usage/today');
  },

  getLimit(): Promise<ShortformLimitResult> {
    return request<ShortformLimitResult>('/api/shortform/limit');
  },

  updateLimit(data: ShortformLimitRequest): Promise<ShortformLimitResult> {
    return request<ShortformLimitResult>('/api/shortform/limit', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
