export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  courseId?: string;
  subjectId?: string;
  accessType?: 'free' | 'paid';
  lectureNumber: number;
  questionType?: 'past_papers' | 'lecture_book' | 'practice' | string;
  imageUrl?: string;
  category?: string;
  folder?: string;
  showInFree?: boolean;
  isPremium?: boolean;
  createdAt?: any;
  version?: number;
  status?: 'draft' | 'published' | 'review';
  history?: any[];
  metadata?: {
    createdBy?: string;
    lastModifiedBy?: string;
    tags?: string[];
  };
  difficulty?: number;
  analytics?: {
    totalAttempts?: number;
    correctAttempts?: number;
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  folder: string;
  lectureNumber: number;
  createdAt?: any;
}

export interface QuizAttempt {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
}
