import express from 'express';
import { ItemController } from '../controllers/itemController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { checkOwnership } from '../middleware/checkOwner';
import { checkItemOwner } from '../middleware/checkItemOwner';

const router = express.Router();

router.post('/', 
  authenticate, 
  authorize(['RESTAURANT_OWNER']), 
  ItemController.createItem);

router.get('/:id', 
  authenticate, 
  ItemController.getItemById);

// Routes dépendantes du restaurant_id
// PATCH /restaurants/:restaurantId/items/:itemId - Mise à jour item dans un restaurant spécifique
router.patch('/:id',
  authenticate,
  authorize(['RESTAURANT_OWNER']),
  checkItemOwner,
  ItemController.updateItem
);

// DELETE /restaurants/:restaurantId/items/:itemId - Suppression item d'un restaurant
router.delete('/:id',
  authenticate,
  authorize(['RESTAURANT_OWNER']),
  checkItemOwner,
  ItemController.deleteItem
);

export default router;