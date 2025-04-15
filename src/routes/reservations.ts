import { Router } from 'express';
import { prisma } from '../prisma/client';

const router = Router();

// GET /reservations – Récupérer toutes les réservations
router.get('/', async (req, res) => {
    try {
        const reservations = await prisma.reservation.findMany();
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// POST /reservations – Créer une réservation
router.post('/', async (req, res) => {
    try {
        const { date, userId, tableId } = req.body;
        const newReservation = await prisma.reservation.create({
            data: { date, userId, tableId },
        });
        res.status(201).json(newReservation);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la création" });
    }
});

export default router;