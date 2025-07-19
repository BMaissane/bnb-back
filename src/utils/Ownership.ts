import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Types pour les ressources standard
type RestaurantResource = 'timeslot' | 'menu' | 'restaurant' | 'item';

// Types pour les tables de liaison
type JunctionTable = 'restaurant_has_item' | 'reservation_has_item' | 'menu_has_item';

// Vérification pour les ressources standard (avec restaurant_id)
export async function isRestaurantResourceOwner(
  userId: number,
  resourceType: RestaurantResource,
  resourceId: number
): Promise<boolean> {
  switch (resourceType) {
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

          case 'item':
      const item = await prisma.restaurant_has_item.findFirst({
        where: { 
          item_id: resourceId,
          restaurant: { owner_id: userId }
        }
      });
      return !!item;

    case 'restaurant':
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: resourceId },
        select: { owner_id: true }
      });
      return restaurant?.owner_id === userId;

    default:
      throw new Error(`Type de ressource non supporté: ${resourceType}`);
  }
}

// Vérification pour les tables de liaison
export async function isJunctionTableOwner(
  userId: number,
  tableType: JunctionTable,
  resourceIds: { firstId: number, secondId: number } // Pour les clés composites
): Promise<boolean> {
  switch (tableType) {
    case 'restaurant_has_item':
      const restaurantItem = await prisma.restaurant_has_item.findUnique({
        where: {
          restaurant_id_item_id: { // Clé composite spécifique
            restaurant_id: resourceIds.firstId,
            item_id: resourceIds.secondId
          }
        },
        include: { restaurant: { select: { owner_id: true } } }
      });
      return restaurantItem?.restaurant.owner_id === userId;

    case 'reservation_has_item':
      const reservationItem = await prisma.reservation_has_item.findUnique({
        where: {
          reservation_id_item_id: { // Clé composite
            reservation_id: resourceIds.firstId,
            item_id: resourceIds.secondId
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
          menu_id_item_id: { // Clé composite
            menu_id: resourceIds.firstId,
            item_id: resourceIds.secondId
          }
        },
        include: { menu: { select: { restaurant: { select: { owner_id: true } } } } }
      });
      return menuItem?.menu.restaurant.owner_id === userId;

    default:
      throw new Error(`Table de liaison non supportée: ${tableType}`);
  }
}