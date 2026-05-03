import { Router } from 'express';
import { getQuestions, getAllQuestions, createQuestion, updateQuestion, deleteQuestion } from '../controllers/questionController';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

// User routes
router.get('/', verifyToken, getQuestions);

// Admin routes
router.get('/all', verifyToken, requireAdmin, getAllQuestions);
router.post('/', verifyToken, requireAdmin, createQuestion);
router.put('/:id', verifyToken, requireAdmin, updateQuestion);
router.delete('/:id', verifyToken, requireAdmin, deleteQuestion);

export default router;
