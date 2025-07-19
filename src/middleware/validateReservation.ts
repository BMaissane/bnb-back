import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { createReservationSchema, updateReservationSchema } from '../interface/dto/reservationDto';

export const validateCreateReservation = (req: Request, res: Response, next: NextFunction) => {
  try {
    createReservationSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        status: 'fail',
        error: error.errors,
      });
    }
    next(error);
  }
};

export const validateUpdateReservation = (req: Request, res: Response, next: NextFunction) => {
  try {
    updateReservationSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        status: 'fail',
        error: error.errors,
      });
    }
    next(error);
  }
};