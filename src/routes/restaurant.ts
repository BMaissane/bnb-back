import express, { Router } from 'express';
import { RestaurantController } from '../controllers/restaurantController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { checkOwnership } from '../middleware/checkOwner';

const restaurantRouter = express.Router();

// Public routes
restaurantRouter.get('/', RestaurantController.getAllRestaurants);
restaurantRouter.get('/search', RestaurantController.search);
restaurantRouter.get('/:id', RestaurantController.getById);

// Protected routes (require authentication)
restaurantRouter.post(
  '/',
  authenticate, // vérifie que l'user est bien authentifié
  authorize(['RESTAURANT_OWNER']),
  checkOwnership, // vérfie le type d'user (client forbidden while restaurant_owner OK)
  RestaurantController.create
);
restaurantRouter.get('/owner/:ownerId', authenticate, RestaurantController.getRestaurantsByOwner);
restaurantRouter.patch('/:id', authenticate, authorize(['RESTAURANT_OWNER']), checkOwnership, RestaurantController.update);
restaurantRouter.delete('/:id', authenticate, authorize(['RESTAURANT_OWNER']), checkOwnership, RestaurantController.delete);

export default restaurantRouter;