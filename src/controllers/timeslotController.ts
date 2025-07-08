import { NextFunction, Request, Response } from 'express';
import { formatTimeslot, TimeslotService } from '../services/timeslotService';
import prisma from '../prisma/client';
import { validateFutureDate } from '../middleware/dateValidation';


export const TimeslotController = {
  // POST /timeslots
  async createTimeslot(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error('Unauthorized');
      
      // Validation date => past dates are not allowed
      const slotDate = validateFutureDate(req.body.date, 'date');
        if (req.body.start_at) {
            validateFutureDate(`${req.body.date}T${req.body.start_at}`, 'heure de début');
        }
        
      const newTimeslot = await TimeslotService.createTimeslot(
        Number(req.body.restaurant_id),
        req.user.id,
        {
          date: req.body.date,
          start_at: req.body.start_at,
          end_at: req.body.end_at,
          capacity: Number(req.body.capacity)
        }
      );
      console.log('erreur debug')
      res.status(201).json(newTimeslot);
    } catch (error) {
      console.log('juste debug')
      next(error);
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

  // PATCH /timeslots/:id
async update(req: Request, res: Response) {
    const { date, start_at, end_at, capacity } = req.body;
    const timeslotId = Number(req.params.timeslotId);

    // 1. Récupérer le timeslot existant
    const current = await prisma.timeslot.findUnique({
        where: { id: timeslotId }
    });

    if (!current) {
        return res.status(404).json({ error: "Timeslot non trouvé" });
    }

    // 2. Préparer les nouvelles valeurs
    const updateData: any = {
        capacity: capacity !== undefined ? capacity : current.capacity
    };

    // 3. Gestion des dates/heures (clé du problème)
    const targetDate = date ? new Date(date) : current.date;
    const dateStr = targetDate.toISOString().split('T')[0];

    if (start_at) {
        updateData.start_at = new Date(`${dateStr}T${start_at}:00Z`); // Notez le Z pour UTC
    }

    if (end_at) {
        updateData.end_at = new Date(`${dateStr}T${end_at}:00Z`); // Notez le Z pour UTC
    }

    // 4. Si on change la date principale
    if (date) {
        updateData.date = targetDate;
        
        // Recalculer start_at/end_at si non fournis
        if (!start_at) {
            const oldTime = current.start_at.toISOString().split('T')[1];
            updateData.start_at = new Date(`${dateStr}T${oldTime}`);
        }
        
        if (!end_at) {
            const oldTime = current.end_at.toISOString().split('T')[1];
            updateData.end_at = new Date(`${dateStr}T${oldTime}`);
        }
    }

    // 5. Mise à jour
    const updated = await prisma.timeslot.update({
        where: { id: timeslotId },
        data: updateData
    });

    // Formatage de la réponse
    res.json({
        ...updated,
        date: updated.date.toISOString().split('T')[0],
        start_at: updated.start_at.toISOString().split('T')[1].slice(0, 5),
        end_at: updated.end_at.toISOString().split('T')[1].slice(0, 5)
    });
},

  // DELETE /timeslots/:id
async delete(req: Request, res: Response, next: NextFunction) {
    try {
        await TimeslotService.deleteTimeslot(Number(req.params.timeslotId)); // ✅ Supprime le timeslot
        res.status(204).send(); // ✅ Réponse vide avec statut 204 (No Content)
    } catch (error) {
        next(error); 
    }
},

  // GET /timeslots/available/:restaurantId
  async getAvailable(req: Request, res: Response, next: NextFunction) {
    try {
      const availableTimeslots = await TimeslotService.getRestaurantTimeslots(
        Number(req.params.restaurantId),
        { status: 'AVAILABLE', date: req.query.date as string }
      );
      res.json(availableTimeslots);
    } catch (error) {
      next(error);
    }
  }
};


