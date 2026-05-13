import { request } from './auth';

export type QuizDifficulty = 'EASY' | 'NORMAL' | 'HARD' | string;

export interface Quiz {
  quizId: number;
  question: string;
  difficulty: QuizDifficulty;
}

export interface QuizSubmitRequest {
  quizId: number;
  answer: number;
}

export interface QuizSubmitResult {
  isCorrect: boolean;
  extendedSeconds: number;
  newTotalLimitSeconds?: number;
  remainingDailyQuizzes?: number;
  message: string;
}

type RawQuizSubmitResult = Partial<QuizSubmitResult> & {
  correct?: boolean;
  is_correct?: boolean;
  result?: boolean;
  success?: boolean;
};

function normalizeSubmitResult(result: RawQuizSubmitResult): QuizSubmitResult {
  return {
    isCorrect:
      result.isCorrect ??
      result.correct ??
      result.is_correct ??
      result.result ??
      result.success ??
      false,
    extendedSeconds: result.extendedSeconds ?? 0,
    newTotalLimitSeconds: result.newTotalLimitSeconds,
    remainingDailyQuizzes: result.remainingDailyQuizzes,
    message: result.message ?? '',
  };
}

export const quizService = {
  generate(): Promise<Quiz> {
    return request<Quiz>('/api/quiz/generate', {
      method: 'POST',
    });
  },

  async submit(data: QuizSubmitRequest): Promise<QuizSubmitResult> {
    const result = await request<RawQuizSubmitResult>('/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return normalizeSubmitResult(result);
  },
};
