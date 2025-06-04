import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { UserType } from '@prisma/client';

declare module 'express' {
  interface Request {
    user?: {
      id: number;
      type_user: UserType; // Changement de 'role' vers 'type_user' pour cohérence
    };
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // 1. Vérification du token avec le bon payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      id: number; 
      type_user: UserType 
    };

    // 2. Vérification de l'utilisateur en base (optionnel mais recommandé)
    const userExists = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, type_user: true }
    });

    if (!userExists) {
      return res.status(401).json({ message: 'Utilisateur non autorisé' });
    }

    // 3. Assignation des données utilisateur
    req.user = {
      id: decoded.id,
      type_user: decoded.type_user
    };

    next();
  } catch (error) {
    // Gestion améliorée des erreurs
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Session expirée', code: 'TOKEN_EXPIRED' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token invalide', code: 'INVALID_TOKEN' });
    }
    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({ message: 'Erreur d\'authentification' });
  }
};

// Middleware d'autorisation typé
export const authorize = (allowedTypes: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedTypes.includes(req.user.type_user)) {
      return res.status(403).json({ 
        message: `Accès non autorisé. Rôles autorisés: ${allowedTypes.join(', ')}`,
        code: 'FORBIDDEN'
      });
    }
    next();
  };
};