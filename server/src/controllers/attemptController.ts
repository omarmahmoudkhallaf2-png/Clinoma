import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { adminDb } from '../config/firebase';

export const submitAttempt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { score, total, answers } = req.body;
    const uid = req.user?.uid;

    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const attemptData = {
      userId: uid,
      score,
      total,
      answers,
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('attempts').add(attemptData);
    res.status(201).json({ id: docRef.id, ...attemptData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit attempt' });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;

    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const attemptsSnapshot = await adminDb
      .collection('attempts')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    let totalQuestions = 0;
    let totalScore = 0;
    let lastScore = 0;
    let lastTotal = 0;
    const attempts: any[] = [];

    attemptsSnapshot.forEach((doc) => {
      const data = doc.data();
      attempts.push({
        id: doc.id,
        ...data,
      });
      totalQuestions += data.total || 0;
      totalScore += data.score || 0;
    });

    if (attempts.length > 0) {
      lastScore = attempts[0].score;
      lastTotal = attempts[0].total;
    }

    const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    res.status(200).json({
      totalQuestions,
      accuracy,
      lastScore,
      lastTotal,
      totalAttempts: attempts.length,
      history: attempts
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};
