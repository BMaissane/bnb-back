import express, { Router } from 'express';
import { RestaurantController } from '../controller/restaurantController';
import { authenticate } from '../middleware/authMiddleware';


const restaurantRouter = express.Router();

// Public routes
restaurantRouter.get('/', RestaurantController.getAll);
restaurantRouter.get('/search', RestaurantController.search);
restaurantRouter.get('/:id', RestaurantController.getById);

// Protected routes (require authentication)
restaurantRouter.post('/', RestaurantController.create);
restaurantRouter.get('/owner/:ownerId', authenticate, RestaurantController.getRestaurantsByOwner);
restaurantRouter.put('/:id', authenticate, RestaurantController.update);
restaurantRouter.delete('/:id', authenticate, RestaurantController.delete);

export default restaurantRouter;