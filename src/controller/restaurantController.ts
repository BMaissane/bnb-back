import { NextFunction, Request, Response } from 'express';
import { CreateRestaurantDto, UpdateRestaurantDto } from '../interface/dto/restaurantDto';
import { RestaurantService } from '../service/restaurantService';
import {errorHandler} from "../middleware/errorHandler";
import prisma from '../prisma/client';
import { ForbiddenError } from '../interface/response/errors';

export const RestaurantController = {
  
  // POST api/restaurants => :id
async create(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Vérification TypeSafe de l'authentification
      if (!req.user) {
        throw new Error('Authentication required'); // Ou utilisez une erreur personnalisée
      }

      // 2. Vérification des permissions (via votre interface typée)
      if (req.user.type_user !== 'RESTAURANT_OWNER') {
        throw new ForbiddenError('Only restaurant owners can create establishments');
      }

      // 3. Préparation des données (type-safe grâce à votre interface)
      const restaurantData: CreateRestaurantDto = {
        ...req.body,
        owner_id: req.user.id // Garanti par le typage de Request.user
      };

      // 4. Appel au service
      const restaurant = await RestaurantService.createRestaurant(restaurantData);
      
      res.status(201).json(restaurant);

    } catch (error) {
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
async getById(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurant = await RestaurantService.getRestaurantById(Number(req.params.id));
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
},

  // GET api/restaurant/owner/:id
  async getRestaurantsByOwner(req: Request, res: Response, next : NextFunction) {
    try {
      const { ownerId } = req.params;
      const restaurants = await RestaurantService.getRestaurantsByOwner(Number(ownerId));
      res.json(restaurants);
    } catch (error) {
      next(error);
    }
  },

  // PUT api/restaurant/:id
async update(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await RestaurantService.updateRestaurant(
      Number(req.params.id),
      req.body
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
},

  // DELETE api/restaurant/:id
async delete(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = Number(req.params.id);
    console.log(`Tentative de suppression du restaurant ${restaurantId}`);
    
    const beforeDelete = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });
    console.log('Avant suppression:', beforeDelete);
    
    await RestaurantService.deleteRestaurant(restaurantId);
    
    const afterDelete = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });
    console.log('Après suppression:', afterDelete);
    
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
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