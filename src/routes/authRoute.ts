import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { UserType } from '@prisma/client';

// Déclaration du type étendu pour Request
declare module 'express' {
  interface Request {
    user?: {
      id: number;
      type_user: UserType;
    };
  }
}

const router = express.Router();

// Route protégée pour restaurateurs
router.get('/restaurant', 
  authenticate,
  (req, res, next) => {
    if (req.user?.type_user !== 'RESTAURANT_OWNER') {
      return res.status(403).json({ 
        message: 'Accès réservé aux restaurateurs',
        code: 'FORBIDDEN'
      });
    }
    next();
  },
  // Votre contrôleur viendra ici
  (req, res) => {
    res.json({ message: 'Bienvenue dans l\'espace restaurateur' });
  }
);

export default router;