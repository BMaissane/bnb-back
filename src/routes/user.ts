import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserType } from '@prisma/client';
import { userController } from '../controllers/userController';
import { UpdateUserSchema } from '../interface/dto/userDto';
import { validate } from '../middleware/validate';
import { checkOwnership } from '../middleware/checkOwner';

const router = Router();

// POST /users - Création utilisateur (public)
router.post('/', userController.createUser);

// GET /users/:id - Récupération profil (authentifié)
router.get('/:id', authenticate, userController.getUserById);

// PUT/UPDATE /users/:id - Modification (authentifié)
// Dans user.ts (routes)
router.put('/:id', 
  authenticate,
  checkOwnership('user'),
  validate(UpdateUserSchema),
  userController.updateUser 
);

// DELETE /users/:id - Suppression & confirmation via mot de passe
router.delete('/:id',
  authenticate, 
  checkOwnership('user'),
  userController.deleteUser
);

export default router;