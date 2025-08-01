import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from './errors';
import { AuthenticatedUser } from '../@types/express';



export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedError('Token manquant');

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthenticatedUser;
    req.user = decoded; // Utilise directement l'interface globale
    next();
  } catch (error) {
    next(new UnauthorizedError('Token invalide ou expiré'));
  }
};

export const authorize = (allowedTypes: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedTypes.includes(req.user!.type_user)) {
      return next(new ForbiddenError('Rôle insuffisant'));
    }
    next();
  };
};