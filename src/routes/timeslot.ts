import express, { Router } from 'express';
import { TimeslotController } from '../controllers/timeslotController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { checkOwnership } from '../middleware/checkOwner';
import { validateTimeslotDates } from '../middleware/timeslotValidation';

const router = express.Router({ mergeParams: true });

// Dans item.ts et timeslot.ts
router.use((req, res, next) => {
  console.log('Incoming params:', req.params); // Debug des paramètres
  next();
});
// Route pour les timeslots disponibles
router.get('/available', TimeslotController.getAvailable);

// 2. Route générale GET /timeslots
router.get('/', (req, res, next) => {
    console.log('Params:', req.params);
    next();
}, TimeslotController.getByRestaurant);

// 3. Toutes les autres routes avec paramètres
router.get('/:id', TimeslotController.getById);

router.patch('/:id', 
  authenticate,
  authorize(['RESTAURANT_OWNER']),
  checkOwnership('timeslot'),
  validateTimeslotDates,
  TimeslotController.update);

router.delete('/:id',
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