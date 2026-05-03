import { Request, Response, NextFunction } from 'express';
import { adminAuth, adminDb } from '../config/firebase';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role: 'admin' | 'user';
    plan: 'free' | 'premium';
  };
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Fetch user details from Firestore to attach role and plan
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    let role: 'admin' | 'user' = 'user';
    let plan: 'free' | 'premium' = 'free';
    
    if (userDoc.exists) {
      const data = userDoc.data();
      role = data?.role || 'user';
      plan = data?.plan || 'free';
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role,
      plan
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }
  next();
};
