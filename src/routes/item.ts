import express, { Router } from 'express';
import { ItemController } from '../controllers/itemController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { checkOwnership } from '../middleware/checkOwner';

const itemRouter = Router();

// POST /items - Créer un article et le lier à un restaurant
itemRouter.post('/', 
    authenticate, authorize(['RESTAURANT_OWNER']), ItemController.createItem);
itemRouter.get('/:id', ItemController.getItemById);
itemRouter.patch('/:id', authenticate, authorize(['RESTAURANT_OWNER']), ItemController.updateItem);
itemRouter.delete('/:id', authenticate, authorize(['RESTAURANT_OWNER']), ItemController.deleteItem);

export default itemRouter;