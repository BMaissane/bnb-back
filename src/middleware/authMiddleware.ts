import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Token missing');

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      type_user: UserType;
    };

    req.user = {
      id: decoded.id,
      type_user: decoded.type_user
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (allowedTypes: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    if (!allowedTypes.includes(req.user.type_user)) {
      return res.status(403).json({ message: 'Permissions insuffisantes' });
    }
    next();
  };
};