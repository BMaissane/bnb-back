import { NextFunction, Request, Response } from 'express';
import { formatTimeslot, TimeslotService } from '../services/timeslotService';
import prisma from '../prisma/client';
import { validateTimeslotDates } from '../middleware/timeslotValidation';


export const TimeslotController = {
  // POST /timeslots
async createTimeslot(req: Request, res: Response, next: NextFunction) {
  try {
    // Vérification unique et explicite
    if (!req.user) throw new Error('Unauthorized');
    
    // Validation des données
    if (!req.body.date || !req.body.start_at || !req.body.end_at) {
      throw new Error('Missing required fields');
    }

    const result = await TimeslotService.createTimeslot(
      Number(req.params.restaurantId),
      req.user.id, // On passe quand même l'ID pour le service
      {
        date: req.body.date,
        start_at: req.body.start_at,
        end_at: req.body.end_at,
        capacity: Number(req.body.capacity) || 10 // Valeur par défaut
      }
    );

    res.status(201).json(formatTimeslot(result));
  } catch (error) {
    next(error); // Gestion centralisée des erreurs
  }
},

  // GET restaurants/restaurantID/timeslots
async getByRestaurant(req: Request, res: Response, next: NextFunction) {
    try {
        // Conversion explicite vers le nom de champ Prisma
        const restaurantId = Number(req.params.restaurantId);
        if (isNaN(restaurantId)) {
            throw new Error("ID de restaurant invalide");
        }

        const filters = {
            restaurant_id: restaurantId, // Match avec le schéma Prisma
            ...(req.query.date && { date: new Date(req.query.date as string) })
        };

        const timeslots = await prisma.timeslot.findMany({
            where: filters,
            orderBy: [{ date: 'asc' }, { start_at: 'asc' }]
        });
        
        res.json(timeslots.map(formatTimeslot));
    } catch (error) {
        next(error);
    }
},

  // GET /timeslots/:id
async getById(req: Request, res: Response, next: NextFunction) {
    try {
        // Validation TypeScript
        const timeslotId = Number(req.params.timeslotId);
        const restaurantId = Number(req.params.restaurantId);
        
        if (isNaN(timeslotId) || isNaN(restaurantId)) {
            throw new Error('IDs invalides');
        }

        const timeslot = await TimeslotService.getTimeslotById(timeslotId, restaurantId);
        res.json(timeslot);
    } catch (error) {
        next(error);
    }
},

// GET /timeslots/available/:restaurantId
async getAvailable(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = Number(req.params.restaurantId);
      
      if (!restaurantId) {
        return res.status(400).json({ error: "ID restaurant requis" });
      }

      const timeslots = await TimeslotService.getAvailableTimeslots(restaurantId);
      res.json(timeslots);

    } catch (error) {
      next(error); // Transmet à votre errorHandler existant
    }
  },

  // PATCH /timeslots/:id
async update(req: Request, res: Response, next : NextFunction) {
    try {
        const updated = await TimeslotService.updateTimeslot(
            Number(req.params.timeslotId),
            req.body // Transmet toutes les données brutes
        );
        res.json(updated); // Reçoit déjà des données formatées
    } catch (error) {
       next(error);
    }
},

  // DELETE /timeslots/:id
async delete(req: Request, res: Response, next: NextFunction) {
    try {
        await TimeslotService.deleteTimeslot(Number(req.params.timeslotId)); 
        res.status(204).send(); // ✅ Réponse vide avec statut 204 (No Content)
    } catch (error) {
        next(error); 
    }
}
};


