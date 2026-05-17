import type { SRSResult, Flashcard } from "../types/flashcard";

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
      if (rating === 1) interval = 5;       // Hard new card: 5 min
      else if (rating === 2) interval = 10;  // Good new card: 10 min
      else interval = 30;                    // Easy new card: 30 min
    } else if (repetitions === 1) {
      if (rating === 1) interval = 15;      // Hard: 15 min
      else if (rating === 2) interval = 30;      // Good: 30 min
      else interval = 120;                   // Easy: 120 min (2h)
    } else {
      // Subsequent repetitions: scale by ease factor and rating multiplier
      const multiplier = rating === 1 ? 1.2 : rating === 2 ? easeFactor : easeFactor * 1.5;
      interval = Math.round(interval * multiplier);
    }
    repetitions++;
    
    // Adjust ease factor
    const q = rating + 2; // Map 1-3 to 3-5
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  } else {
    // Incorrect response (Again)
    repetitions = 0;
    interval = 1; // 1 minute for Again
    status = 'relearning';
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  if (easeFactor < 1.3) easeFactor = 1.3;
  
  // Cap interval at 120 minutes (2 hours) as requested
  if (interval > 120) interval = 120;

  // Set next review using the calculated interval in minutes
  const nextReview = Date.now() + interval * 60 * 1000;

  return {
    nextReview,
    interval,
    easeFactor,
    repetitions,
    status
  };
}

