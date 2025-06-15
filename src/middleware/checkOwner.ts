// src/middlewares/isOwner.ts
import { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../interface/response/errors';


export const checkOwner = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) throw new Error('Middleware appelé sans authentification');
  
  if (req.user.type_user !== 'RESTAURANT_OWNER') {
    throw new ForbiddenError('Accès réservé aux propriétaires de restaurants');
  }
  
  next();
};