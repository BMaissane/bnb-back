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
  authenticate,
//  authorize([UserType.CLIENT, UserType.RESTAURANT_OWNER]), 
  ReservationController.getByUser
);

router.patch(
  '/:id/cancel',
  authenticate,
//  checkOwnership({ model: 'reservation' }),
  validateCreateReservation,
  ReservationController.cancel
);

// // Seul le propriétaire peut voir les réservations de son restaurant
// router.get(
//   '/restaurant/:restaurantId',
//   authorize([UserType.RESTAURANT_OWNER]),
//   checkOwnership({ model: 'restaurant', idParam: 'restaurantId' }),
//   controller.getByRestaurantId
// );

export default router;