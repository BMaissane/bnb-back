import express, { Router } from 'express';
import { ItemController } from '../controllers/itemController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { checkOwnership } from '../middleware/checkOwner';

const itemRouter = Router();

// POST /items - Créer un article et le lier à un restaurant
itemRouter.post('/', 
    authenticate, authorize(['RESTAURANT_OWNER']), ItemController.createItem);
itemRouter.get('/:id', authenticate, 
    //checkOwnership('restaurant_has_item'), 
    ItemController.getItemById);
// itemRoutes.ts
itemRouter.patch('/:id', 
  authenticate,
  authorize(['RESTAURANT_OWNER']),
  checkOwnership('restaurant_has_item'), // Utilisera restaurantId ET itemId
  ItemController.updateItem
);

itemRouter.delete('/:id',
  authenticate,
  authorize(['RESTAURANT_OWNER']),
  checkOwnership('restaurant_has_item'),
  ItemController.deleteItem
);
export default itemRouter;