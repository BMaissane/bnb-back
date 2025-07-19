import { NextFunction, Request, Response } from 'express';
import { ReservationService } from '../services/reservationService';
import { UpdateReservationInput } from '../interface/dto/reservationDto';


export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  async create(req: Request, res: Response, next : NextFunction) {
    try {
      // req.body est déjà validé par le middleware Zod
      const reservation = await this.reservationService.create(req.body);
      res.status(201).json(reservation);
    } catch (error) {
    next(error);
    }
  }

    async getById(req: Request, res: Response, next : NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id; // Authentification déjà vérifiée
      const reservation = await this.reservationService.getById(id, userId);
      res.json(reservation);
    } catch (error) {
   next(error);
    }
  }

    async getByUser(req: Request, res: Response, next : NextFunction) {
    try {
      const userId = parseInt(req.params.userId);
      
      // Vérifier que l'utilisateur demande ses propres réservations
      if (userId !== req.user!.id && req.user!.type_user !== 'RESTAURANT_OWNER') {
        return res.status(403).json({ 
          error: 'Accès non autorisé',
          code: 'FORBIDDEN'
        });
      }

      const reservations = await this.reservationService.getByUserId(userId);
      res.json(reservations);
    } catch (error) {
    next(error);
    }
  }

  async update(req: Request, res: Response, next : NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      const input: UpdateReservationInput = req.body;

      const updated = await this.reservationService.update(id, userId, input);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
  
async cancel(req: Request, res: Response, next: NextFunction) {
    try {
        const reservation = await this.reservationService.cancel(
            parseInt(req.params.id),
            req.user!.id,
            req.body.reason
        );
        res.json(reservation);
    } catch (error) {
        next(error); // Transmission à l'errorHandler central
    }
}
}