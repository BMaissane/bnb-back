import { NextFunction, Request, Response } from 'express';
import { ReservationService } from '../services/reservationService';
import { UpdateReservationInput } from '../interface/dto/reservationDto';
import { NotFoundError } from '../middleware/errors';
import prisma from '../prisma/client';


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

// reservationController.ts - getByRestaurant
async getByRestaurant(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = Number(req.params.id); // Note: 'id' si votre route est '/:id/reservations'
    const userId = req.user!.id;

    console.log(`[ReservationController] Fetching reservations for restaurant ${restaurantId} by user ${userId}`);

    if (isNaN(restaurantId)) {
      throw new NotFoundError("ID de restaurant invalide");
    }

    // Vérifier que le restaurant existe et appartient à l'utilisateur
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId, owner_id: userId },
      select: { id: true }
    });

    if (!restaurant) {
      throw new NotFoundError("Restaurant non trouvé ou non autorisé");
    }

    const reservations = await ReservationService.getAllRestaurantReservations(restaurantId);
    console.log(`[ReservationController] Found ${reservations.length} reservations`);
    res.json(reservations);
  } catch (error) {
    console.error('[ReservationController] Error in getByRestaurant:', error);
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