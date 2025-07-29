import express from 'express';
import { menuController } from '../controllers/menuController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import prisma from '../prisma/client';
import { checkOwnership } from '../middleware/checkOwner';


const router = express.Router();

// Routes publiques
router.get('/:id', menuController.getMenuById); // GET /api/menu/10
router.get('/:restaurantId/menus', menuController.getMenusByRestaurant);

// Routes protégées
router.post(
  '/',
  authenticate,
  authorize(['RESTAURANT_OWNER']),
  checkOwnership('menu'),
  menuController.createMenu
);

router.put(
  '/:id',
  authenticate,
  authorize(['RESTAURANT_OWNER']),
  checkOwnership('menu'),
  menuController.updateMenu
);

router.delete(
  '/:id',
  authenticate,
  authorize(['RESTAURANT_OWNER']),
  checkOwnership('menu'),
  menuController.deleteMenu
);

export default router;