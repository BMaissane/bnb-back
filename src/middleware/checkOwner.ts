import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ForbiddenError } from './errors';

const prisma = new PrismaClient();

// Types
type RestaurantResource = 'restaurant' | 'timeslot' | 'menu';
type JunctionTable = 'restaurant_has_item' | 'reservation_has_item' | 'menu_has_item';
type ResourceType = RestaurantResource | JunctionTable;

// Helper functions
const parseId = (id: any): number => {
  const num = Number(id);
  if (isNaN(num)) throw new Error(`ID invalide: ${id}`);
  return num;
};

async function safePrismaQuery<T>(query: Promise<T>): Promise<T | null> {
  try {
    return await query;
  } catch (error) {
    console.error("Erreur Prisma:", error);
    return null;
  }
}

// Vérification des ressources standards
async function isRestaurantResourceOwner(
  userId: number,
  resourceType: RestaurantResource,
  resourceId: number
): Promise<boolean> {
  switch (resourceType) {
    case 'restaurant': {
      const resource = await safePrismaQuery(
        prisma.restaurant.findUnique({
          where: { id: resourceId },
          select: { owner_id: true }
        })
      );
      return resource?.owner_id === userId;
    }

    case 'timeslot': {
      const resource = await safePrismaQuery(
        prisma.timeslot.findUnique({
          where: { id: resourceId },
          select: { restaurant: { select: { owner_id: true } } }
        })
      );
      return resource?.restaurant.owner_id === userId;
    }

    case 'menu': {
      const resource = await safePrismaQuery(
        prisma.menu.findUnique({
          where: { id: resourceId },
          select: { restaurant: { select: { owner_id: true } } }
        })
      );
      return resource?.restaurant.owner_id === userId;
    }

    default:
      throw new Error(`Type de ressource non supporté: ${resourceType}`);
  }
}

// Helper pour les tables de liaison
async function isJunctionTableOwner(
  userId: number,
  tableType: JunctionTable,
  ids: { firstId: number; secondId: number }
): Promise<boolean> {
  switch (tableType) {
    case 'restaurant_has_item': {
      const resource = await safePrismaQuery(
        prisma.restaurant_has_item.findUnique({
          where: {
            restaurant_id_item_id: {
              restaurant_id: ids.firstId,
              item_id: ids.secondId
            }
          },
          include: { restaurant: { select: { owner_id: true } } }
        })
      );
      return resource?.restaurant.owner_id === userId;
    }

    case 'reservation_has_item': {
      const resource = await safePrismaQuery(
        prisma.reservation_has_item.findUnique({
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
        })
      );
      return resource?.reservation.user_id === userId || 
             resource?.reservation.restaurant.owner_id === userId;
    }

    case 'menu_has_item': {
      const resource = await safePrismaQuery(
        prisma.menu_has_item.findUnique({
          where: {
            menu_id_item_id: {
              menu_id: ids.firstId,
              item_id: ids.secondId
            }
          },
          include: { 
            menu: { 
              select: { 
                restaurant: { 
                  select: { 
                    owner_id: true 
                  } 
                } 
              } 
            } 
          }
        })
      );
      return resource?.menu.restaurant.owner_id === userId;
    }

    default:
      throw new Error(`Table de liaison non supportée: ${tableType}`);
  }
}

// Middleware principal
export const checkOwnership = (resourceType: ResourceType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new ForbiddenError('Authentification requise');
      const userId = parseId(req.user.id);

      // Vérification pour les ressources standards
      if (['restaurant', 'timeslot', 'menu'].includes(resourceType)) {
        const resourceId = parseId(req.params.id);
        const isOwner = await isRestaurantResourceOwner(
          userId,
          resourceType as RestaurantResource,
          resourceId
        );
        if (!isOwner) throw new ForbiddenError();
        return next();
      }

      // Vérification pour les tables de liaison
      let firstId: number, secondId: number;
      
      switch (resourceType) {
        case 'restaurant_has_item':
          firstId = parseId(req.params.restaurantId);
          secondId = parseId(req.params.itemId);
          break;
        case 'reservation_has_item':
          firstId = parseId(req.params.reservationId);
          secondId = parseId(req.params.itemId);
          break;
        case 'menu_has_item':
          firstId = parseId(req.params.menuId);
          secondId = parseId(req.params.itemId);
          break;
        default:
          throw new Error(`Type de ressource non géré: ${resourceType}`);
      }

      const isOwner = await isJunctionTableOwner(
        userId,
        resourceType as JunctionTable,
        { firstId, secondId }
      );
      if (!isOwner) throw new ForbiddenError();

      next();
    } catch (error) {
      next(error);
    }
  };
};