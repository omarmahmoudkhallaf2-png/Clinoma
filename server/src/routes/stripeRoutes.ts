import { Router } from 'express';
import { createCheckoutSession, webhook, createCustomerPortalSession } from '../controllers/stripeController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/create-checkout-session', verifyToken, createCheckoutSession);
router.post('/create-portal-session', verifyToken, createCustomerPortalSession);
router.post('/webhook', webhook);

export default router;
