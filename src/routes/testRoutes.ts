// testRoutes.ts
import express from 'express';
const router = express.Router();

router.post('/test-login', (req, res) => {
  res.status(200).json({ message: 'Route de test OK' });
});

export default router;