import express, { Router } from 'express';
import { ItemController } from '../controllers/itemController';

const itemRouter = Router();

// POST /items - Créer un article et le lier à un restaurant
itemRouter.post('/', ItemController.createItem);

export default itemRouter;