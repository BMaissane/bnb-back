import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { loginUser, registerUser } from '../controller/authController';

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser)

router.get('/restaurant', authenticate, (req, res) => {
  res.json({ message: 'Espace restaurateur' });
});


export default router;