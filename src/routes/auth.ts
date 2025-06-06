import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { loginUser, registerUser } from '../controller/authController';

const router = express.Router();

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser)

// Route for restaurant_owner
router.get('/restaurant', authenticate, (req, res) => {
  res.json({ message: 'Espace restaurateur' });
});


export default router;