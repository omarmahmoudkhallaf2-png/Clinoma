import { Question } from '../models/Question';

export const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'What is the most common cause of community-acquired pneumonia?',
    options: ['Streptococcus pneumoniae', 'Mycoplasma pneumoniae', 'Haemophilus influenzae', 'Legionella pneumophila'],
    correctAnswer: '0',
    explanation: 'Streptococcus pneumoniae remains the leading cause of community-acquired pneumonia (CAP) across all age groups.',
    category: 'Internal Medicine',
    isPremium: false,
    createdAt: new Date()
  },
  {
    id: '2',
    text: 'A 45-year-old male presents with severe crushing chest pain. Which is the immediate next step?',
    options: ['Chest X-ray', 'ECG', 'Troponin level', 'CT Angiography'],
    correctAnswer: '1',
    explanation: 'ECG is the most crucial first step in suspected myocardial infarction to determine the need for reperfusion.',
    category: 'Cardiology',
    isPremium: true,
    createdAt: new Date()
  }
];

export const mockAttempts: any[] = [];
