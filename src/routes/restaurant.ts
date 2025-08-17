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
  authenticate, 
  authorize(['RESTAURANT_OWNER']),
  RestaurantController.create
);
restaurantRouter.get('/owner/:ownerId', authenticate, RestaurantController.getRestaurantsByOwner);
restaurantRouter.patch('/:id', 
  authenticate, 
  authorize(['RESTAURANT_OWNER']), 
  checkOwnership('restaurant'),
   RestaurantController.update);
restaurantRouter.delete('/:id',
   authenticate, 
   authorize(['RESTAURANT_OWNER']), 
   checkOwnership('restaurant'), 
   RestaurantController.delete);

export default restaurantRouter;