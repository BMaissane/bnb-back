import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ForbiddenError } from './errors';

const prisma = new PrismaClient();


export const checkItemOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ForbiddenError('Authentification requise');
    
    const itemId = Number(req.params.id);
    if (isNaN(itemId)) throw new ForbiddenError('ID item invalide');

    // Vérification de l'ownership
    const itemRelation = await prisma.restaurant_has_item.findFirst({
      where: {
        item_id: itemId,
        restaurant: { owner_id: req.user.id }
      },
      select: { restaurant_id: true }
    });

    if (!itemRelation) {
      throw new ForbiddenError("Vous ne possédez pas cet item");
    }

    // Assignation typée de restaurantId
    req.restaurantId = itemRelation.restaurant_id;
    next();
  } catch (error) {
    next(error);
  }
};