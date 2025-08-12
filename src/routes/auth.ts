import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { AuthController} from '../controllers/authController';

const router = express.Router();

// Register
router.post('/register', AuthController.registerUser);

// Login
router.post('/login', AuthController.loginUser)

// New password/ Forgotten Password
router.post('/forgot-password', AuthController.forgotPassword); 
router.post('/reset-password', AuthController.resetPassword);  

// Route for restaurant_owner
router.get('/restaurant', authenticate, (req, res) => {
  res.json({ message: 'Espace restaurateur' });
});


export default router;