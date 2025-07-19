import { NextFunction, Request, Response } from 'express';
import { MenuService } from '../services/menuService';
import { CreateMenuSchema, UpdateMenuDto } from '../interface/dto/menuDto';
import { z } from 'zod';
import { HttpException } from '../exception/httpException';
import prisma from '../prisma/client';

export const menuController = {
   
  // POST api/restaurant/:id/menu
async createMenu(req: Request, res: Response, next: NextFunction) {
    try {
       const restaurantId = Number(req.params.restaurantId); // Récupération depuis l'URL
   if (!req.user) throw new Error('Unauthorized');
       const validatedData = CreateMenuSchema.parse({
      ...req.body,
      restaurantId // Injection dans le DTO
    });
      const menu = await MenuService.createMenu(validatedData);
      res.status(201).json(menu);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  },

  // GET /api/restaurants/:id/menus
  async getRestaurantMenus(req: Request, res: Response) {
    try {
      const restaurantId = Number(req.params.restaurantId);
      
      if (isNaN(restaurantId)) {
        return res.status(400).json({ error: "Invalid restaurant ID" });
      }

      const menus = await prisma.menu.findMany({ // Notez findMany au lieu de findUnique
        where: { 
          restaurant_id: restaurantId 
        },
        include: {
          menu_has_item: {
            include: {
              item: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  category: true,
                  base_price: true
                }
              }
            }
          }
        }
      });
      console.log("Params received:", req.params);
      res.status(200).json(menus);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // GET /api/restaurants/:id/menus/:id
async getMenubyId(req: Request, res: Response) {
  try {
    const { restaurantId, menuId } = req.params;
    
    console.log(`Recherche menu ${menuId} dans restaurant ${restaurantId}`); // Debug

    const menu = await prisma.menu.findFirst({
      where: {
        id: Number(menuId),
        restaurant_id: Number(restaurantId)
      },
      include: {
        menu_has_item: {
          include: { item: true }
        }
      }
    });

    if (!menu) {
      console.log('Menu non trouvé');
      return res.status(404).json({ 
        error: "Menu not found",
        params: req.params 
      });
    }

    res.json(menu);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
},


  // PUT api/restaurants/:id/menus/:id
  async updateMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateMenuSchema.partial().parse(req.body);
      const updatedMenu = await MenuService.updateMenu(
        Number(req.params.menuId),
        validatedData
      );
      res.json(updatedMenu);
    } catch (error) {
      next(error);
    }
  },

  // DELETE api/restaurant/:id/menu/:id
  async deleteMenu(req: Request, res: Response, next: NextFunction) {
    try {
         if (!req.user) throw new Error('Unauthorized');
      await MenuService.deleteMenu(Number(req.params.menuId));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

}

