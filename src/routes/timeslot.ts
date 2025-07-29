import express, { Router } from 'express';
import { TimeslotController } from '../controllers/timeslotController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { checkOwnership } from '../middleware/checkOwner';
import { validateTimeslotDates } from '../middleware/timeslotValidation';

const router = express.Router({ mergeParams: true });

// Route pour les timeslots disponibles
router.get('/available', TimeslotController.getAvailable);

// 2. Route générale GET /timeslots
router.get('/', (req, res, next) => {
    console.log('Params:', req.params);
    next();
}, TimeslotController.getByRestaurant);

// 3. Toutes les autres routes avec paramètres
router.get('/:timeslotId', TimeslotController.getById);
router.patch('/:timeslotId', 
  authenticate,
  authorize(['RESTAURANT_OWNER']),
  checkOwnership('timeslot'),
  validateTimeslotDates,
  TimeslotController.update);

router.delete('/:timeslotId',
  authenticate,
  authorize(['RESTAURANT_OWNER']),
  checkOwnership('timeslot'),
  TimeslotController.delete);

// 4. Route POST à la fin
router.post('/',
  authenticate,
  authorize(['RESTAURANT_OWNER']),
  // checkOwnership('restaurant'),
  validateTimeslotDates,
  TimeslotController.createTimeslot);

export default router;