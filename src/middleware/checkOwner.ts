import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ForbiddenError } from './errors';

const prisma = new PrismaClient();

type ResourceType = 
  | 'restaurant' 
  | 'menu' 
  | 'timeslot'
  | 'reservation'
  | 'user'
  | 'restaurant_has_item'
  | 'menu_has_item';

export const checkOwnership = (resourceType: ResourceType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new ForbiddenError('Authentification requise');
      const userId = req.user.id;

      // 1. Récupération des IDs selon le type de ressource
      let resourceId: number | { firstId: number, secondId: number };
      
      if (['restaurant', 'menu', 'timeslot', 'user'].includes(resourceType)) {
        resourceId = Number(req.params.id);
        if (isNaN(resourceId)) throw new ForbiddenError('ID invalide');
      } else {
        resourceId = {
          firstId: Number(req.params[`${resourceType.split('_')[0]}Id`]),
          secondId: Number(req.params.itemId || req.params.menuId)
        };
        if (isNaN(resourceId.firstId) || isNaN(resourceId.secondId)) {
          throw new ForbiddenError('IDs invalides');
        }
      }
console.log(
  `[Ownership Check] User ${userId} trying to access ${resourceType} ${JSON.stringify(resourceId)}`
);
      // 2. Vérification d'ownership avec typage explicite
      let isOwner: boolean;

      switch (resourceType) {
        case 'restaurant': {
          const restaurant = await prisma.restaurant.findUnique({
            where: { id: resourceId as number },
            select: { owner_id: true }
          });
          isOwner = restaurant?.owner_id === userId;
          break;
        }

        case 'menu': {
          const menu = await prisma.menu.findUnique({
            where: { id: resourceId as number },
            select: { restaurant: { select: { owner_id: true } } }
          });
          isOwner = menu?.restaurant.owner_id === userId;
          break;
        }

        case 'timeslot': {
          const timeslot = await prisma.timeslot.findUnique({
            where: { id: resourceId as number },
            select: { restaurant: { select: { owner_id: true } } }
          });
          isOwner = timeslot?.restaurant.owner_id === userId;
          break;
        }

        case 'reservation': {
  const reservation = await prisma.reservation.findUnique({
    where: { id: resourceId as number },
    select: { 
      user_id: true,
      restaurant: { select: { owner_id: true } } 
    }
  });
  
  isOwner = reservation?.user_id === userId 
           || reservation?.restaurant.owner_id === userId;
  break;
}

case 'user': {
  const user = await prisma.user.findUnique({
    where: { id: resourceId as number },
    select: { 
      id: true // On vérifie seulement l'ID utilisateur
    }
  });
  isOwner = user?.id === userId; // L'user ne peut agir que sur son propre compte
  break;
}
        case 'restaurant_has_item': {
          const rhi = await prisma.restaurant_has_item.findUnique({
            where: {
              restaurant_id_item_id: {
                restaurant_id: (resourceId as { firstId: number, secondId: number }).firstId,
                item_id: (resourceId as { firstId: number, secondId: number }).secondId
              }
            },
            include: { restaurant: { select: { owner_id: true } } }
          });
          isOwner = rhi?.restaurant.owner_id === userId;
          break;
        }

        case 'menu_has_item': {
          const mhi = await prisma.menu_has_item.findUnique({
            where: {
              menu_id_item_id: {
                menu_id: (resourceId as { firstId: number, secondId: number }).firstId,
                item_id: (resourceId as { firstId: number, secondId: number }).secondId
              }
            },
            include: { menu: { select: { restaurant: { select: { owner_id: true } } } } }
          });
          isOwner = mhi?.menu.restaurant.owner_id === userId;
          break;
        }
        default:
          throw new Error(`Type de ressource non supporté: ${resourceType}`);
      }

      if (!isOwner) {
        throw new ForbiddenError('Action non autorisée sur cette ressource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};