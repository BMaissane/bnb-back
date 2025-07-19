import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ForbiddenError } from './errors';

const prisma = new PrismaClient();

// Types pour les ressources
type RestaurantResource = 'restaurant' | 'timeslot' | 'menu';
type JunctionTable = 'restaurant_has_item' | 'reservation_has_item' | 'menu_has_item';
type ResourceType = RestaurantResource | JunctionTable;

// Helper pour vérifier l'ownership des ressources standards
async function isRestaurantResourceOwner(
  userId: number,
  resourceType: RestaurantResource,
  resourceId: number
): Promise<boolean> {
  switch (resourceType) {
    case 'restaurant':
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: resourceId },
        select: { owner_id: true }
      });
      return restaurant?.owner_id === userId;

    case 'timeslot':
      const timeslot = await prisma.timeslot.findUnique({
        where: { id: resourceId },
        select: { restaurant: { select: { owner_id: true } } }
      });
      return timeslot?.restaurant.owner_id === userId;

    case 'menu':
      const menu = await prisma.menu.findUnique({
        where: { id: resourceId },
        select: { restaurant: { select: { owner_id: true } } }
      });
      return menu?.restaurant.owner_id === userId;

    default:
      throw new Error(`Type de ressource non supporté: ${resourceType}`);
  }
}

// Helper pour les tables de liaison (clés composites)
async function isJunctionTableOwner(
  userId: number,
  tableType: JunctionTable,
  ids: { firstId: number, secondId: number }
): Promise<boolean> {
  switch (tableType) {
    case 'restaurant_has_item':
      const restaurantItem = await prisma.restaurant_has_item.findUnique({
        where: {
          restaurant_id_item_id: {
            restaurant_id: ids.firstId,
            item_id: ids.secondId
          }
        },
        include: { restaurant: { select: { owner_id: true } } }
      });
      return restaurantItem?.restaurant.owner_id === userId;

    case 'reservation_has_item':
      const reservationItem = await prisma.reservation_has_item.findUnique({
        where: {
          reservation_id_item_id: {
            reservation_id: ids.firstId,
            item_id: ids.secondId
          }
        },
        include: { 
          reservation: { 
            select: { 
              user_id: true,
              restaurant: { select: { owner_id: true } }
            }
          }
        }
      });
      return reservationItem?.reservation.user_id === userId || 
             reservationItem?.reservation.restaurant.owner_id === userId;

    case 'menu_has_item':
      const menuItem = await prisma.menu_has_item.findUnique({
        where: {
          menu_id_item_id: {
            menu_id: ids.firstId,
            item_id: ids.secondId
          }
        },
        include: { menu: { select: { restaurant: { select: { owner_id: true } } } } }
      });
      return menuItem?.menu.restaurant.owner_id === userId;

    default:
      throw new Error(`Table de liaison non supportée: ${tableType}`);
  }
}

// Middleware principal
export const checkOwnership = (resourceType: ResourceType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new Error('Utilisateur non authentifié');
      const userId = req.user.id;
      let isOwner: boolean;

      // Vérification pour les ressources standards
      if (['restaurant', 'timeslot', 'menu'].includes(resourceType)) {
        isOwner = await isRestaurantResourceOwner(
          userId, 
          resourceType as RestaurantResource, 
          Number(req.params.id)
        );
      } 
      // Vérification pour les tables de liaison
      else {
        // Extraction des IDs composites depuis les paramètres d'URL
        let firstId: number, secondId: number;

        switch (resourceType) {
          case 'restaurant_has_item':
            firstId = Number(req.params.restaurantId);
            secondId = Number(req.params.itemId);
            break;
          case 'reservation_has_item':
            firstId = Number(req.params.reservationId);
            secondId = Number(req.params.itemId);
            break;
          case 'menu_has_item':
            firstId = Number(req.params.menuId);
            secondId = Number(req.params.itemId);
            break;
          default:
            throw new Error(`Type de ressource non géré: ${resourceType}`);
        }

        isOwner = await isJunctionTableOwner(
          userId,
          resourceType as JunctionTable,
          { firstId, secondId }
        );
      }

      if (!isOwner) throw new ForbiddenError('Accès non autorisé à cette ressource');
      next();
    } catch (error) {
      next(error); // Transmet à l'errorHandler central
    }
  };
};