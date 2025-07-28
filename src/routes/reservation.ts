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

router.get(
  '/:id',
  authenticate,
  ReservationController.getById
);

router.get(
  '/user/:userId',
  authorize([UserType.CLIENT, UserType.RESTAURANT_OWNER]),
  ReservationController.getByUser
);

// Mettre à jour une réservation (statut OU informations)
router.patch(
  '/:id',
  authorize(['CLIENT']),
  ReservationController.update
);

// Annuler une réservation (version alternative)
router.patch(
  '/:id/cancel',
  ReservationController.cancel
);


// Seul le propriétaire peut voir les réservations de son restaurant
router.get(
  '/restaurant/:restaurantId',
  //authorize([UserType.RESTAURANT_OWNER]),
  ReservationController.getByRestaurant
);

export default router;