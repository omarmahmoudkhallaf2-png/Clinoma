import { Router } from 'express';
import { submitAttempt, getUserStats } from '../controllers/attemptController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', verifyToken, submitAttempt);
router.get('/user', verifyToken, getUserStats);

export default router;
