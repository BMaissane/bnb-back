import express from 'express';
import { TimeslotController } from '../controllers/timeslotController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// POST /api/restaurants/:id/timeslots
router.post('/', 
  authenticate, 
  authorize(['RESTAURANT_OWNER']), 
  TimeslotController.createTimeslot
);

// GET /api/restaurants/:id/timeslots
router.get('/', TimeslotController.getByRestaurant);

// GET /api/restaurants/:id/timeslots/available
router.get('/available', TimeslotController.getAvailable);

// GET /api/timeslots/:id (conservé pour la cohérence)
router.get('/:timeslotId', TimeslotController.getById);

// PATCH /api/timeslots/:id
router.patch('/:timeslotId', 
  authenticate,
  authorize(['RESTAURANT_OWNER']),
  TimeslotController.update
);

// DELETE /api/timeslots/:id
router.delete('/:timeslotId', 
  authenticate,
  authorize(['RESTAURANT_OWNER']),
  TimeslotController.delete
);

export default router;