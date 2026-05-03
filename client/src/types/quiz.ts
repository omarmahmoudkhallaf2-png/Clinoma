export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  isPremium: boolean;
}

export interface QuizAttempt {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
}
