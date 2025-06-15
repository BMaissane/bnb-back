import { NextFunction, Request, Response } from 'express';
import { CreateRestaurantDto, UpdateRestaurantDto } from '../interface/dto/restaurantDto';
import { RestaurantService } from '../service/restaurantService';
import {errorHandler} from "../middleware/errorHandler";

export const RestaurantController = {
  
  // POST api/restaurants => :id
  async create(req: Request, res: Response, next : NextFunction) {
    try {
      const data: CreateRestaurantDto = req.body;
      const restaurant = await RestaurantService.createRestaurant(data);
      res.status(201).json(restaurant);
    } catch (error) {
      console.error('Erreur création restaurant:', error);
      next(error);
    }
  },

  // GET api/restaurant
  async getAll(req: Request, res: Response, next : NextFunction) {
    try {
      const restaurants = await RestaurantService.getAllRestaurants();
      res.json(restaurants);
    } catch (error) {
       next(error);
    }
  },

  // GET api/restaurant/:id
  async getById(req: Request, res: Response, next : NextFunction) {
    try {
      const { id } = req.params;
      const restaurant = await RestaurantService.getRestaurantById(Number(id));
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      res.json(restaurant);
    } catch (error) {
       next(error);
    }
  },

  // GET api/restaurant/owner/:id
  async getByOwner(req: Request, res: Response, next : NextFunction) {
    try {
      const { ownerId } = req.params;
      const restaurants = await RestaurantService.getRestaurantsByOwner(Number(ownerId));
      res.json(restaurants);
    } catch (error) {
      next(error);
    }
  },

  // PUT api/restaurant/:id
  async update(req: Request, res: Response, next : NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateRestaurantDto = req.body;
      const restaurant = await RestaurantService.updateRestaurant(Number(id), data);
      res.json(restaurant);
    } catch (error) {
      console.error(error);
       next(error);
    }
  },

  // DELETE api/restaurant/:id
  async delete(req: Request, res: Response, next : NextFunction) {
    try {
      const { id } = req.params;
      await RestaurantService.deleteRestaurant(Number(id));
      res.status(204).send();
    } catch (error) {
       next(error);
    }
  },

  // GET api/restaurant
  async search(req: Request, res: Response, next : NextFunction) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const restaurants = await RestaurantService.searchRestaurants(q.toString());
      res.json(restaurants);
    } catch (error) {
       next(error);
    }
  }
};