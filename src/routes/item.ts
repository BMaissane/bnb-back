import express from 'express';
import { ItemController } from '../controllers/itemController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { checkOwnership } from '../middleware/checkOwner';


const itemRouter = express.Router();

// POST /items - Créer un article
itemRouter.post('/', 
    authenticate, 
    authorize(['RESTAURANT_OWNER']), 
    ItemController.createItem);

// GET /items/:id - Récupérer un article
itemRouter.get('/:id', 
    authenticate, 
    ItemController.getItemById);

// PATCH /restaurants/:restaurantId/items/:itemId - Mettre à jour un article
itemRouter.patch('/restaurants/:restaurantId/items/:id', 
    authenticate,
    authorize(['RESTAURANT_OWNER']),
    checkOwnership('item'),
    ItemController.updateItem);

// DELETE /restaurants/:restaurantId/items/:itemId - Supprimer un article
itemRouter.delete('/restaurants/:restaurantId/items/:itemId',
    authenticate,
    authorize(['RESTAURANT_OWNER']),
    checkOwnership('restaurant_has_item'),
    ItemController.deleteItem);

export default itemRouter;