import express, { Router } from 'express';
import { TimeslotController } from '../controllers/timeslotController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { checkOwnership } from '../middleware/checkOwner';
import { validateTimeslotDates } from '../middleware/timeslotValidation';

const router = express.Router({ mergeParams: true });

// route test
router.use((req, res, next) => {
  console.log('Incoming params:', req.params);
  next();
});

router.get('/status', (req, res) => {
  res.status(200).json({ status: 'Route est OK' });
});

export default router;