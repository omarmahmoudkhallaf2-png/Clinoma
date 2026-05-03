export interface Question {
  id?: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  isPremium: boolean;
  createdAt?: any;
}
