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

export const quizService = {
  generate(): Promise<Quiz> {
    return request<Quiz>('/api/quiz/generate', {
      method: 'POST',
    });
  },

  submit(data: QuizSubmitRequest): Promise<QuizSubmitResult> {
    return request<QuizSubmitResult>('/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
