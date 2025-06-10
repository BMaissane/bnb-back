import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserType } from '@prisma/client';
import {
  createUser,
  getUserById,
  updateUser,
  deleteUser
} from '../controller/userController';

const router = Router();

// POST /users - Création utilisateur (public)
router.post('/', createUser);

// GET /users/:id - Récupération profil (authentifié)
router.get('/:id', authenticate, getUserById);

// PUT/UPDATE /users/:id - Modification (authentifié + propriétaire ou admin)
router.put('/:id', 
  authenticate,
  authorize([UserType.CLIENT, UserType.RESTAURANT_OWNER]),
  updateUser
);

// DELETE /users/:id - Suppression & confirmation via mot de passe
router.delete('/:id',
  authenticate,
  deleteUser
);

export default router;