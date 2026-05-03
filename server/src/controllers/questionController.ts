import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { adminDb } from '../config/firebase';
import { Question } from '../models/Question';

export const getQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userPlan = req.user?.plan || 'free';
    const questionsSnapshot = await adminDb.collection('questions').get();
    
    const questions: Question[] = [];
    questionsSnapshot.forEach((doc) => {
      const data = doc.data() as Question;
      data.id = doc.id;
      
      // If user is on a free plan, filter out premium questions
      if (userPlan === 'free' && data.isPremium) {
        return;
      }
      
      questions.push(data);
    });

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const getAllQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const questionsSnapshot = await adminDb.collection('questions').orderBy('createdAt', 'desc').get();
    
    const questions: Question[] = [];
    questionsSnapshot.forEach((doc) => {
      const data = doc.data() as Question;
      data.id = doc.id;
      questions.push(data);
    });

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all questions' });
  }
};

export const createQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const questionData: Question = req.body;
    questionData.createdAt = new Date();
    
    const docRef = await adminDb.collection('questions').add(questionData);
    res.status(201).json({ id: docRef.id, ...questionData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
};

export const updateQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // التعديل هنا: إضافة (id as string) لضمان النوع
    await adminDb.collection('questions').doc(id as string).update(updates);
    res.status(200).json({ id, ...updates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
};

export const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // التعديل هنا: إضافة (id as string) لضمان النوع
    await adminDb.collection('questions').doc(id as string).delete();
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
};