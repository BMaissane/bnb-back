import { Router } from 'express';
import { prisma } from '../prisma/client';

const router = Router();

// GET /reservations – Récupérer toutes les réservations
router.get('/', async (req, res) => {
    try {
        const reservations = await prisma.reservation.findMany({
            include: {
                user: true,
                restaurant: true,
                timeslot: true
            }
        });
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// POST /reservations – Créer une réservation
router.post('/', async (req, res) => {
    try {
        const { userId, restaurantId, timeslotId } = req.body;

        // Validation des données
        if (!userId || !restaurantId || !timeslotId) {
            return res.status(400).json({ error: "Données manquantes" });
        }

        // Vérifier la disponibilité du timeslot
        const timeslot = await prisma.timeslot.findUnique({
            where: { id: timeslotId },
            select: { capacity: true }
        });

        if (!timeslot || timeslot.capacity <= 0) {
            return res.status(400).json({ error: "Créneau indisponible" });
        }

        // Création de la réservation
        const newReservation = await prisma.reservation.create({
            data: { 
                user_id: userId,
                timeslot_id: timeslotId,
                restaurant_id: restaurantId,
                status: "CONFIRMED"
            },
            include: {
                timeslot: true
            }
        });

        // Mettre à jour la capacité
        await prisma.timeslot.update({
            where: { id: timeslotId },
            data: { capacity: { decrement: 1 } }
        });

        res.status(201).json(newReservation);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la création" });
    }
});

export default router;