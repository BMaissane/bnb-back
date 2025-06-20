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

  // GET api/restaurant/:id/menu/:id
async getMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const menu = await prisma.menu.findUnique({
        where: { id: Number(req.params.id) },
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
      
      if (!menu) throw new HttpException(404, 'Menu not found');
      res.json(menu);
    } catch (error) {
      next(error);
    }
  },

  // GET RESTAURANT WITH MENUS api/restaurants/:id/menu
  async getRestaurantMenus(req: Request, res: Response, next: NextFunction) {
    try {
      const menus = await MenuService.getMenusByRestaurant(
        Number(req.params.restaurantId)
      );
      res.json(menus);
    } catch (error) {
      next(error);
    }
  },

  // PUT api/restaurants/:id/menu/:id
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
      await MenuService.deleteMenu(Number(req.params.menuId));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

}

