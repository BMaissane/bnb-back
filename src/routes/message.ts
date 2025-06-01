import express from 'express';
import * as MessageController from '../controller/messageController';
import { authenticate } from '../middleware/auth'; // À implémenter

const router = express.Router();

router.post('/', authenticate, MessageController.create);
router.get('/:userId', authenticate, MessageController.getAll);
router.delete('/:id', authenticate, MessageController.delete);

export default router;