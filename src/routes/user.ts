import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserType } from '@prisma/client';
import {
  createUser,
  getUser,
  updateUser,
  deleteUser
} from '../controller/userController';

const router = Router();

// POST /users - Création utilisateur (public)
router.post('/', createUser);

// GET /users/:id - Récupération profil (authentifié)
router.get('/:id', authenticate, getUser);

// PATCH /users/:id - Modification (authentifié + propriétaire ou admin)
router.patch('/:id', 
  authenticate,
  authorize([UserType.CLIENT, UserType.RESTAURANT_OWNER]),
  updateUser
);

// DELETE /users/:id - Suppression (admin seulement)
router.delete('/:id',
  authenticate,
  authorize([UserType.RESTAURANT_OWNER]),
  deleteUser
);

export default router;