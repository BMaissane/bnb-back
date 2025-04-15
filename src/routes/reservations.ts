import { Router } from 'express';
import { prisma } from '../prisma/client';

const router = Router();

// CREATE
router.post('/', async (req, res) => {
  try {
    const reservation = await prisma.reservation.create({
      data: {
        user_id: req.body.user_id,
        timeslot_id: req.body.timeslot_id,
        restaurant_id: req.body.restaurant_id, // Champ requis
        status: 'CONFIRMED'
      }
    });
    res.json(reservation);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Données invalides" });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  const reservations = await prisma.reservation.findMany();
  res.json(reservations);
});

export default router;