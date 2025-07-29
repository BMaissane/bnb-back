import { Router } from 'express';
import { UserType } from '@prisma/client';
import { ReservationController } from '../controllers/reservationController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateCreateReservation } from '../middleware/validateReservation';
import { ReservationService } from '../services/reservationService';
import { checkOwnership } from '../middleware/checkOwner';

const router = Router();


// Middleware d'authentification global
router.use(authenticate);

// CRUD des réservations
router.post(
  '/',
  authorize([UserType.CLIENT]), // Seuls les clients peuvent créer
  validateCreateReservation,
  ReservationController.create
);

// GET BY ID FONCTIONNE POUR LES 2 TYPES D'USERS
router.get(
  '/:id',
  authenticate,
  ReservationController.getById
);

// GET TOUTES LES RESERVATIONS LIEES A UN USER
router.get(
  '/user/:userId',
  authorize([UserType.CLIENT, UserType.RESTAURANT_OWNER]),
  ReservationController.getByUser
);

// Seul le propriétaire peut voir les réservations de son restaurant
router.get('/restaurants/:restaurantId/reservations',
  authenticate,
  authorize(['RESTAURANT_OWNER']),
  checkOwnership('restaurant'), // Vérifie que l'user est bien proprio
  ReservationController.getByRestaurant
);

// Mettre à jour une réservation (statut OU informations)
router.patch(
  '/:id',
  authorize(['CLIENT']),
  checkOwnership('reservation'), 
  ReservationController.update
);

// Annuler une réservation (version alternative)
router.patch(
  '/:id/cancel',
  authorize(['CLIENT', 'RESTAURANT_OWNER']),
  checkOwnership('reservation'), 
  ReservationController.cancel
);
;

export default router;