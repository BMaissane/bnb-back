import { Router } from 'express';
import { menuController } from '../controllers/menuController';
import { authenticate } from '../middleware/authMiddleware';
import { checkOwner } from '../middleware/checkOwner';

const router = Router({ mergeParams: true });

// Public routes
// GET /api/restaurants/:restaurantId/menus
router.get('/restaurants/:restaurantId/menus', menuController.getRestaurantMenus);

// GET /api/restaurants/:restaurantId/menus/:menuId
router.get('/restaurants/:restaurantId/menus/:menuId', menuController.getMenubyId);

// Protected routes (require authentication)
router.post('/', authenticate, menuController.createMenu);
router.put('/:menuId', authenticate, menuController.updateMenu);
router.delete('/:menuId', authenticate, menuController.deleteMenu);
router.get('/', authenticate, menuController.getRestaurantMenus);

export default router;