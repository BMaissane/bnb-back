import { Router } from 'express';
import { prisma } from '../prisma/client';

const router = Router();

// Route TEST simple
router.get('/test', async (req, res) => {
  try {
    res.json({ message: "Ça marche !" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;