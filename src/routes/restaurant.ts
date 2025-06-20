import express, { Router } from 'express';
import { RestaurantController } from '../controllers/restaurantController';
import { authenticate } from '../middleware/authMiddleware';
import { checkOwner } from '../middleware/checkOwner';

const restaurantRouter = express.Router();

// Public routes
restaurantRouter.get('/', RestaurantController.getAllRestaurants);
restaurantRouter.get('/search', RestaurantController.search);
restaurantRouter.get('/:id', RestaurantController.getById);

// Protected routes (require authentication)
restaurantRouter.post(
  '/',
  authenticate, // vérifie que l'user est bien authentifié
  checkOwner, // vérfie le type d'user (client forbidden while restaurant_owner OK)
  RestaurantController.create
);
restaurantRouter.get('/owner/:ownerId', authenticate, RestaurantController.getRestaurantsByOwner);
restaurantRouter.put('/:id', authenticate, RestaurantController.update);
restaurantRouter.delete('/:id', authenticate, RestaurantController.delete);

export default restaurantRouter;