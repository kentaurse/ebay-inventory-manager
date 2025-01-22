import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      isAdmin: user.isAdmin 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
} 