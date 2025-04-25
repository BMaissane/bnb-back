import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { UserType } from '@prisma/client';

declare module 'express' {
  interface Request {
    user?: {
      id: number; // Notez que c'est un number (coherent avec Prisma)
      role: UserType; 
    };
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // 1. Vérification et décodage du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // 2. Conversion de l'ID en number (important pour Prisma)
    const userId = parseInt(decoded.userId, 10);
    if (isNaN(userId)) {
      return res.status(401).json({ message: 'Format de token invalide' });
    }

    // 3. Récupération de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        type_user: true // 'type' au lieu de 'role' si c'est le nom dans votre schéma
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    // 4. Assignation typée de l'utilisateur
    req.user = {
      id: user.id,
      role: user.type_user
    };

    next();
  } catch (error) {
    // Gestion différenciée des erreurs
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expiré' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token invalide' });
    }
    console.error('Erreur auth:', error);
    return res.status(500).json({ message: 'Erreur interne' });
  }
};

export const authorize = (allowedTypes: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedTypes.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Accès réservé aux: ${allowedTypes.join(', ')}` 
      });
    }
    next();
  };
};