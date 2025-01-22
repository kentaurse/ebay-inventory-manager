import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { Logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: any;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    Logger.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
} 