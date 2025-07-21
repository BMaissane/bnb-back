import { Router } from 'express';
import { UserType } from '@prisma/client';
import { ReservationController } from '../controllers/reservationController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateCreateReservation } from '../middleware/validateReservation';
import { ReservationService } from '../services/reservationService';
import { checkOwnership } from '../middleware/checkOwner';

const router = Router();
const service = new ReservationService();
const controller = new ReservationController(service);

// Middleware d'authentification global
router.use(authenticate);

// CRUD des réservations
router.post(
  '/',
  authenticate,
  validateCreateReservation,
  controller.create
);

router.get(
  '/:id',
  authenticate,
  controller.getById
);

router.get(
  '/user/:userId',
  authenticate,
  authorize([UserType.CLIENT, UserType.RESTAURANT_OWNER]), 
  controller.getByUser
);

router.patch(
  '/:id/cancel',
  authenticate,
  validateCreateReservation,
  controller.cancel
);

// // Seul le propriétaire peut voir les réservations de son restaurant
// router.get(
//   '/restaurant/:restaurantId',
//   authorize([UserType.RESTAURANT_OWNER]),
//   checkOwnership({ model: 'restaurant', idParam: 'restaurantId' }),
//   controller.getByRestaurantId
// );

export default router;