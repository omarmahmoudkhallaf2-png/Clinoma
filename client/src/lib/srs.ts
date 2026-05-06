import { SRSResult, Flashcard } from "../types/flashcard";

/**
 * SuperMemo-2 (SM-2) algorithm implementation for Spaced Repetition
 */
export function calculateSRS(
  rating: 0 | 1 | 2 | 3, // 0: Again, 1: Hard, 2: Good, 3: Easy
  currentRepetitions: number,
  currentInterval: number,
  currentEaseFactor: number
): SRSResult {
  let repetitions = currentRepetitions;
  let interval = currentInterval;
  let easeFactor = currentEaseFactor;
  let status: Flashcard['status'] = 'review';

  if (rating >= 1) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
    
    // Adjust ease factor
    // EF' := EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    // We map 1, 2, 3 to higher values for the formula
    const q = rating + 2; // Map 1-3 to 3-5
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  } else {
    // Incorrect response
    repetitions = 0;
    interval = 1;
    status = 'relearning';
    // easeFactor stays same or slightly decreases
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;

  return {
    nextReview,
    interval,
    easeFactor,
    repetitions,
    status
  };
}
