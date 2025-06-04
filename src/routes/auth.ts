// src/routes/authRoutes.ts
import express from 'express';
import { loginUser, registerUser } from '../controller/authController';
import { validateLogin, validateRegister } from '../middleware/auth';

const router = express.Router();

router.post('/api/signup', validateRegister, registerUser);
router.post('/api/login', validateLogin, loginUser);

export default router;