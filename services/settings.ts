import * as FileSystem from 'expo-file-system/legacy';
import { tokenStore } from './token';

export type ProblemDifficulty = '쉬움' | '보통' | '어려움' | '끄기';

export interface DifficultySettings {
  difficulty: ProblemDifficulty;
  frequencyMinutes: number;
  isCustomFrequency: boolean;
}

export interface UserSettings {
  nickname: string;
  shortformLimitSeconds: number;
  hasSavedShortformLimit: boolean;
  difficultySettings: DifficultySettings;
}

const STORAGE_KEY = 'liontest:user-settings';
const SETTINGS_FILE = `${FileSystem.documentDirectory ?? ''}liontest-user-settings.json`;

const defaultSettings: UserSettings = {
  nickname: '닉네임',
  shortformLimitSeconds: 3 * 60 * 60,
  hasSavedShortformLimit: false,
  difficultySettings: {
    difficulty: '보통',
    frequencyMinutes: 5,
    isCustomFrequency: false,
  },
};

let memorySettings: UserSettings = {
  ...defaultSettings,
  difficultySettings: { ...defaultSettings.difficultySettings },
};

function getWebStorage() {
  return (globalThis as { localStorage?: Storage }).localStorage;
}

async function readNativeSettings() {
  if (!FileSystem.documentDirectory) return null;

  try {
    const info = await FileSystem.getInfoAsync(SETTINGS_FILE);
    if (!info.exists) return null;

    return await FileSystem.readAsStringAsync(SETTINGS_FILE);
  } catch {
    return null;
  }
}

function normalizeSettings(settings?: Partial<UserSettings> | null): UserSettings {
  const difficultySettings = settings?.difficultySettings;

  return {
    nickname: settings?.nickname?.trim() || tokenStore.getNickname() || defaultSettings.nickname,
    shortformLimitSeconds: Math.max(
      0,
      Number(settings?.shortformLimitSeconds) || defaultSettings.shortformLimitSeconds
    ),
    hasSavedShortformLimit:
      settings?.hasSavedShortformLimit ?? defaultSettings.hasSavedShortformLimit,
    difficultySettings: {
      difficulty: difficultySettings?.difficulty ?? defaultSettings.difficultySettings.difficulty,
      frequencyMinutes: Math.max(
        1,
        Number(difficultySettings?.frequencyMinutes) ||
          defaultSettings.difficultySettings.frequencyMinutes
      ),
      isCustomFrequency:
        difficultySettings?.isCustomFrequency ??
        defaultSettings.difficultySettings.isCustomFrequency,
    },
  };
}

async function persist(settings: UserSettings) {
  memorySettings = settings;
  const serializedSettings = JSON.stringify(settings);

  getWebStorage()?.setItem(STORAGE_KEY, serializedSettings);

  if (FileSystem.documentDirectory) {
    await FileSystem.writeAsStringAsync(SETTINGS_FILE, serializedSettings);
  }
}

export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    const saved = getWebStorage()?.getItem(STORAGE_KEY) ?? (await readNativeSettings());

    if (!saved) {
      return normalizeSettings(memorySettings);
    }

    try {
      memorySettings = normalizeSettings(JSON.parse(saved) as Partial<UserSettings>);
    } catch {
      memorySettings = normalizeSettings(memorySettings);
    }

    return memorySettings;
  },

  async updateNickname(nickname: string): Promise<UserSettings> {
    const current = await this.getSettings();
    const next = normalizeSettings({ ...current, nickname });

    tokenStore.setNickname(next.nickname);
    await persist(next);

    return next;
  },

  async updateDifficultySettings(
    difficultySettings: DifficultySettings
  ): Promise<UserSettings> {
    const current = await this.getSettings();
    const next = normalizeSettings({ ...current, difficultySettings });

    await persist(next);

    return next;
  },

  async updateShortformLimit(shortformLimitSeconds: number): Promise<UserSettings> {
    const current = await this.getSettings();
    const next = normalizeSettings({
      ...current,
      shortformLimitSeconds,
      hasSavedShortformLimit: true,
    });

    await persist(next);

    return next;
  },
};
