import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';

// Configuration
const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';
const JWT_EXPIRES_IN = '24h';

/**
 * Hash un mot de passe
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare un mot de passe avec son hash
 */
export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Génère un JWT token
 */
export const generateToken = (userId: number, type: UserType): string => {
  return jwt.sign(
    { userId, type },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Vérifie et décode un token JWT
 */
export const verifyToken = (token: string): { userId: number; type: UserType } => {
  return jwt.verify(token, JWT_SECRET) as { userId: number; type: UserType };
};