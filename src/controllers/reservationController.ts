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
      const reservation = await ReservationService.getById(id);
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

async getByRestaurant(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('Tentative d\'accès aux réservations du restaurant'); // Debug
    const restaurantId = Number(req.params.restaurantId);
    const userId = req.user!.id;

    console.log(`Restaurant ID: ${restaurantId}, User ID: ${userId}`); // Debug

    const reservations = await ReservationService.getByRestaurantId(restaurantId);
    console.log(`Réservations trouvées: ${reservations.length}`); // Debug
    res.json(reservations);
  } catch (error) {
    console.error('Erreur dans getByRestaurant:', error); // Debug
    next(error);
  }
},

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('UPDATE BODY:', req.body); // Debug
      const id = Number(req.params.id);
      if (isNaN(id)) throw new Error('ID invalide');
      
      const updated = await ReservationService.update(id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('CANCEL BODY:', req.body); // Debug
      const id = Number(req.params.id);
      const updated = await ReservationService.cancel(id, req.body.reason);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
};