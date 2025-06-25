import express, { Router } from 'express';
import { ItemController } from '../controllers/itemController';

const itemRouter = Router();

// POST /items - Créer un article et le lier à un restaurant
itemRouter.post('/', ItemController.createItem);
itemRouter.get('/:id', ItemController.getItemById);
itemRouter.patch('/:id', ItemController.updateItem);
itemRouter.delete('/:id', ItemController.deleteItem);

export default itemRouter;