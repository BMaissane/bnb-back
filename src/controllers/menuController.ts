import { NextFunction, Request, Response } from 'express';
import { MenuService } from '../services/menuService';
import { CreateMenuDto, CreateMenuSchema, UpdateMenuDto, UpdateMenuSchema } from '../interface/dto/menuDto';
import { z } from 'zod';
import { HttpException } from '../exception/httpException';
import prisma from '../prisma/client';
import { ForbiddenError, NotFoundError } from '../middleware/errors';

export const menuController = {
   
  // POST api/restaurant/:id/menu
async createMenu(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Vérification du type d'utilisateur
    if (req.user?.type_user !== 'RESTAURANT_OWNER') {
      throw new ForbiddenError('Accès réservé aux restaurateurs');
    }

    // 2. Récupération d'un restaurant du propriétaire
    const restaurant = await prisma.restaurant.findFirst({
      where: { owner_id: req.user.id },
      select: { id: true }
    });

    if (!restaurant) {
      throw new ForbiddenError('Aucun restaurant associé à votre compte');
    }

    // 3. Validation et injection du restaurantId
    const validatedData: CreateMenuDto = {
      ...CreateMenuSchema.parse(req.body),
      restaurantId: restaurant.id
    };

    const menu = await MenuService.createMenu(validatedData);
    res.status(201).json(menu);
  } catch (error) {
    next(error);
  }
},

  // GET /api/restaurants/:id/menus
async getMenusByRestaurant(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = Number(req.params.id);
    
    if (isNaN(restaurantId)) {
      throw new NotFoundError("ID de restaurant invalide");
    }

    // Vérifier que le restaurant existe
    const restaurantExists = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true }
    });

    if (!restaurantExists) {
      throw new NotFoundError("Restaurant non trouvé");
    }

    const menus = await MenuService.getMenusByRestaurant(restaurantId);
    res.json(menus);
  } catch (error) {
    next(error);
  }
},

  // GET /api/restaurants/:id/menus/:id
async getMenuById(req: Request, res: Response, next: NextFunction) {
  try {
    const menuId = Number(req.params.id);
    if (isNaN(menuId)) {
      throw new NotFoundError("ID de menu invalide"); // Utilisez BadRequestError au lieu de NotFoundError
    }

    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        menu_has_item: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                base_price: true
              }
            }
          }
        }
      }
    });

    if (!menu) {
      throw new NotFoundError("Menu non trouvé"); // C'est ici qu'il faut vérifier
    }

    res.json(menu);
  } catch (error) {
    next(error);
  }
},

  // PUT api/restaurants/:id/menus/:id
async updateMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const menuId = Number(req.params.id);
    if (isNaN(menuId)) {
      throw new NotFoundError("ID de menu invalide");
    }

    // Validation des données (Zod)
    const validatedData = UpdateMenuSchema.parse(req.body);

    // Appel au service (pas besoin de restaurantId, vérifié par checkOwnership)
    const updatedMenu = await MenuService.updateMenu(menuId, validatedData);

    res.json(updatedMenu);
  } catch (error) {
    next(error);
  }
},

  // DELETE api/restaurant/:id/menu/:id
async deleteMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const menuId = Number(req.params.id);
    if (isNaN(menuId)) {
      throw new NotFoundError("ID de menu invalide");
    }

    await MenuService.deleteMenu(menuId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
},

}

