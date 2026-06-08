/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuestionType = 'short-essay' | 'short-answer' | 'matching' | 'problem-solving' | 'define';

export const DifficultyLevel = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  VERY_HARD: 'very_hard'
} as const;

export type DifficultyLevel = typeof DifficultyLevel[keyof typeof DifficultyLevel];

export interface Question {
  id: string;
  chapterId: number;
  type: QuestionType;
  title: string;
  content: string;
  answer: string;
  isClinical: boolean;
  topic?: string;
  explanation?: string;
}

export interface Chapter {
  id: number;
  title: string;
  topics: string[];
}

export interface UserProgress {
  reviewList: string[]; // Question IDs
  masteredIds: string[]; // Easy IDs
  sessionQueue: { questionId: string; reappearIndex: number }[];
}
