import { Router } from 'express';
import { menuController } from '../controllers/menuController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { checkOwnership } from '../middleware/checkOwner';


const router = Router({ mergeParams: true });

// Public routes
// GET /api/restaurants/:restaurantId/menus
router.get('/restaurants/:restaurantId/menus', menuController.getRestaurantMenus);

// GET /api/restaurants/:restaurantId/menus/:menuId
router.get('/restaurants/:restaurantId/menus/:menuId', menuController.getMenubyId);

// Protected routes (require authentication)
router.post('/', authenticate, authorize(['RESTAURANT_OWNER']), checkOwnership, menuController.createMenu);
router.put('/:menuId', authenticate, authorize(['RESTAURANT_OWNER']), checkOwnership, menuController.updateMenu);
router.delete('/:menuId', authenticate, authorize(['RESTAURANT_OWNER']), checkOwnership, menuController.deleteMenu);
router.get('/', authenticate, menuController.getRestaurantMenus);

export default router;