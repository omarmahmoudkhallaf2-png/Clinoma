export interface Mask {
  id: string;
  type: 'rect' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface CardImage {
  url: string;
  masks: Mask[];
  scale?: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  userId: string;
  front: string;
  back: string;
  frontImage?: CardImage;
  backImage?: CardImage;
  tags: string[];
  subject: string;
  createdAt: number;
  
  // SRS Data
  nextReview: number; // timestamp
  interval: number; // in days
  easeFactor: number; // default 2.5
  repetitions: number; // consecutive correct answers
  status: 'new' | 'learning' | 'review' | 'relearning';
}

export interface Deck {
  id: string;
  userId: string;
  title: string;
  description: string;
  subject: string;
  createdAt: number;
  cardCount: number;
  isPublic?: boolean;
  dueCount?: number;
  originalDeckId?: string;
  year?: string;
  module?: string;
}


export interface SRSResult {
  nextReview: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
  status: Flashcard['status'];
}
