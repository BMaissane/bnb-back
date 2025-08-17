import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { AuthController} from '../controllers/authController';
import { LoginSchema, RegisterSchema } from '../interface/dto/userDto';
import { validate } from '../middleware/validate';

const router = express.Router();

// Register
router.post('/register', validate(RegisterSchema), AuthController.registerUser);

// Login
router.post('/login', validate(LoginSchema), AuthController.loginUser)

// New password/ Forgotten Password
router.post('/forgot-password', AuthController.forgotPassword); 
router.post('/reset-password', AuthController.resetPassword);  

// Route for restaurant_owner
router.get('/restaurant', authenticate, (req, res) => {
  res.json({ message: 'Espace restaurateur' });
});


export default router;