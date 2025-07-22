import { NextFunction, Request, Response } from 'express';
import { ReservationService } from '../services/reservationService';
import { UpdateReservationInput } from '../interface/dto/reservationDto';


export const ReservationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await ReservationService.create(req.body);
      res.status(201).json(reservation);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      const reservation = await ReservationService.getById(id, userId);
      res.json(reservation);
    } catch (error) {
      next(error);
    }
  },

  async getByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId);
      
      // Vérification des droits
      if (userId !== req.user!.id && req.user!.type_user !== 'RESTAURANT_OWNER') {
        return res.status(403).json({ 
          error: 'Accès non autorisé',
          code: 'FORBIDDEN'
        });
      }

      const reservations = await ReservationService.getByUserId(userId);
      res.json(reservations);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      const input: UpdateReservationInput = req.body;

      const updated = await ReservationService.update(id, userId, input);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await ReservationService.cancel(
        parseInt(req.params.id),
        req.user!.id,
        req.body.reason
      );
      res.json(reservation);
    } catch (error) {
      next(error);
    }
  }
};