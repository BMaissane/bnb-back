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
  authorize([UserType.CLIENT]), // Seuls les clients peuvent créer
  validateCreateReservation,
  controller.create
);

router.get(
  '/:id',
  checkOwnership({ model: 'reservation' }),
  controller.getById
);

router.get(
  '/user/:userId',
  authorize([UserType.CLIENT, UserType.RESTAURANT_OWNER]), 
  controller.getByUser
);

router.patch(
  '/:id/cancel',
  checkOwnership({ model: 'reservation' }),
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