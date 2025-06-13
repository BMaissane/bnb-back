import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { loginUser, 
  registerUser,   
  forgotPassword, 
  resetPassword } from '../controller/authController';

// Pour éviter de configurer un vrai SMTP en développement
export function sendMockEmail(to: string, content: string) {
  console.log(`[EMAIL MOCK] À: ${to}\nContenu: ${content}`);
}