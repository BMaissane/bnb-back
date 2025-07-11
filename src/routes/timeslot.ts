import express, { Router } from 'express';
import { TimeslotController } from '../controllers/timeslotController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router({ mergeParams: true }); 

// POST /api/restaurants/:id/timeslots
router.post('/', 
  authenticate, 
  authorize(['RESTAURANT_OWNER']), 
  TimeslotController.createTimeslot
);

// GET /api/restaurants/:id/timeslots
router.get('/', (req, res, next) => {
    console.log('Params in router middleware:', req.params); // Debug
    next();
}, TimeslotController.getByRestaurant);

// GET /api/timeslots/available/:restaurantId
router.get('/available', TimeslotController.getAvailable);

// GET /api/timeslots/:id (conservé pour la cohérence)
router.get('/:timeslotId', TimeslotController.getById); 

// PATCH /api/timeslots/:id
router.patch('/:timeslotId', 
  authenticate, authorize(['RESTAURANT_OWNER']), 
  TimeslotController.update);


// DELETE /api/timeslots/:id
router.delete('/:timeslotId', 
  authenticate, authorize(['RESTAURANT_OWNER']),
   TimeslotController.delete);

export default router;