import { NextFunction, Request, Response } from 'express';
import { TimeslotService } from '../services/timeslotService';


export const TimeslotController = {
  // POST /timeslots
  async createTimeslot(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error('Unauthorized');
      
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

  // GET /timeslots/restaurant/:id
  async getByRestaurant(req: Request, res: Response, next: NextFunction) {
    try {
      const timeslots = await TimeslotService.getRestaurantTimeslots(
        Number(req.params.id),
        req.query.date ? { date: req.query.date as string } : undefined
      );
      res.json(timeslots);
    } catch (error) {
      next(error);
    }
  },

  // GET /timeslots/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const timeslot = await TimeslotService.getTimeslotById(Number(req.params.id));
      if (!timeslot) {
        return res.status(404).json({ message: 'Timeslot not found' });
      }
      res.json(timeslot);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /timeslots/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await TimeslotService.updateTimeslot(
        Number(req.params.id),
        req.body
      );
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /timeslots/:id
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const timeslotId = Number(req.params.id);
      console.log(`Attempting to delete timeslot ${timeslotId}`);
      
      const beforeDelete = await TimeslotService.getTimeslotById(timeslotId);
      console.log('Before deletion:', beforeDelete);
      
      await TimeslotService.deleteTimeslot(timeslotId);
      
      const afterDelete = await TimeslotService.getTimeslotById(timeslotId);
      console.log('After deletion:', afterDelete);
      
      res.status(204).send();
    } catch (error) {
      console.error('Deletion error:', error);
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