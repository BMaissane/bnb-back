import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { loginUser, 
  registerUser,   
  forgotPassword, 
  resetPassword } from '../controller/authController';

const router = express.Router();

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser)

// New password/ Forgotten Password
router.post('/forgot-password', forgotPassword); 
router.post('/reset-password', resetPassword);  

// Route for restaurant_owner
router.get('/restaurant', authenticate, (req, res) => {
  res.json({ message: 'Espace restaurateur' });
});


export default router;