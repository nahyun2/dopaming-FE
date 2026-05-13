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
  quizNextPromptAtMs: number | null;
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
  quizNextPromptAtMs: null,
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
  const frequencyMinutes = Math.max(
    1,
    Number(difficultySettings?.frequencyMinutes) ||
      defaultSettings.difficultySettings.frequencyMinutes
  );
  const quizNextPromptAtMs =
    settings?.quizNextPromptAtMs === undefined
      ? defaultSettings.quizNextPromptAtMs
      : settings.quizNextPromptAtMs;

  return {
    nickname: settings?.nickname?.trim() || tokenStore.getNickname() || defaultSettings.nickname,
    shortformLimitSeconds:
      settings?.shortformLimitSeconds === undefined
        ? defaultSettings.shortformLimitSeconds
        : Math.max(0, Number(settings.shortformLimitSeconds) || 0),
    hasSavedShortformLimit:
      settings?.hasSavedShortformLimit ?? defaultSettings.hasSavedShortformLimit,
    difficultySettings: {
      difficulty: difficultySettings?.difficulty ?? defaultSettings.difficultySettings.difficulty,
      frequencyMinutes,
      isCustomFrequency:
        difficultySettings?.isCustomFrequency ??
        defaultSettings.difficultySettings.isCustomFrequency,
    },
    quizNextPromptAtMs:
      typeof quizNextPromptAtMs === 'number' && Number.isFinite(quizNextPromptAtMs)
        ? quizNextPromptAtMs
        : null,
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

function getNextQuizPromptAt(settings: UserSettings, fromMs = Date.now()) {
  return fromMs + settings.difficultySettings.frequencyMinutes * 60 * 1000;
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
    const next = normalizeSettings({
      ...current,
      difficultySettings,
      quizNextPromptAtMs:
        difficultySettings.difficulty === '끄기'
          ? null
          : Date.now() + difficultySettings.frequencyMinutes * 60 * 1000,
    });

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

  async scheduleNextQuizPrompt(fromMs = Date.now()): Promise<UserSettings> {
    const current = await this.getSettings();
    const next = normalizeSettings({
      ...current,
      quizNextPromptAtMs:
        current.difficultySettings.difficulty === '끄기'
          ? null
          : getNextQuizPromptAt(current, fromMs),
    });

    await persist(next);

    return next;
  },

  async clearSettings(): Promise<void> {
    memorySettings = normalizeSettings(defaultSettings);
    getWebStorage()?.removeItem(STORAGE_KEY);

    if (FileSystem.documentDirectory) {
      try {
        const info = await FileSystem.getInfoAsync(SETTINGS_FILE);

        if (info.exists) {
          await FileSystem.deleteAsync(SETTINGS_FILE);
        }
      } catch {
        // Settings cleanup should not block account deletion navigation.
      }
    }
  },
};
