import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserType } from '@prisma/client';
import {
  createUser,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController';
import { UpdateUserSchema } from '../interface/dto/userDto';
import { validate } from '../middleware/validate';
import { checkOwnership } from '../middleware/checkOwner';

const router = Router();

// POST /users - Création utilisateur (public)
router.post('/', createUser);

// GET /users/:id - Récupération profil (authentifié)
router.get('/:id', authenticate, getUserById);

// PUT/UPDATE /users/:id - Modification (authentifié)
// Dans user.ts (routes)
router.put('/:id', 
  authenticate,
  checkOwnership('user'),
  validate(UpdateUserSchema),
  updateUser 
);

// DELETE /users/:id - Suppression & confirmation via mot de passe
router.delete('/:id',
  authenticate, 
  checkOwnership('user'),
  deleteUser
);

export default router;