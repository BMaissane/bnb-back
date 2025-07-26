import { PrismaClient, TimeslotStatus } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

// Interface request timelsot
interface TimeslotRequestBody {
  date?: string | Date;
  start_at?: string;
  end_at?: string;
  capacity?: number;
  status?: TimeslotStatus;
  restaurant_id?: number;
  [key: string]: any;
}

export const validateTimeslotDates = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
    try {
      const now = new Date();
      
      // Validation pour la création (POST)
      if (req.body.date) {
        const slotDate = new Date(req.body.date);
        if (slotDate < now) {
          return res.status(400).json({
            error: 'DATE_PAST',
            message: 'La date du créneau ne peut pas être dans le passé'
          });
        }
      }

      // Validation pour la modification (PATCH/PUT)
      if (req.body.start_at) {
        const slotDateTime = new Date(req.body.start_at);
        if (slotDateTime < now) {
          return res.status(400).json({
            error: 'START_TIME_PAST',
            message: 'L\'heure de début ne peut pas être dans le passé'
          });
        }
      }

    } catch (error) {
      return res.status(400).json({
        error: 'INVALID_DATE_FORMAT',
        message: 'Format de date/heure invalide'
      });
    }
  }
  next();
};