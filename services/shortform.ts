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

export const shortformService = {
  recordUsage(data: ShortformUsageRequest): Promise<ShortformUsageResult> {
    return request<ShortformUsageResult>('/api/shortform/usage', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
