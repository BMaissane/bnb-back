import express from 'express';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/restaurant', authenticate, (req, res) => {
  res.json({ message: 'Espace restaurateur' });
});


export default router;