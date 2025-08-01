import { PrismaClient, ItemCategory } from '@prisma/client';
import { NotFoundError } from '../middleware/errors';
const prisma = new PrismaClient();

export const ItemService = {
  async createItemWithRestaurantLink(
    itemData: {
      name: string;
      description?: string | null;
      category: ItemCategory;
      basePrice: number;
    },
    restaurantId: number,
    options?: {
      menuId?: number; // Nouveau paramètre optionnel
      initialStock?: number;
    }
  ) {
    const { menuId, initialStock = 0 } = options || {};

    return await prisma.$transaction(async (tx) => {
      // 1. Création de l'item
      const newItem = await tx.item.create({
        data: {
          name: itemData.name,
          description: itemData.description ?? null,
          category: itemData.category,
          base_price: itemData.basePrice,
        },
      });

      // 2. Liaison au restaurant
      await tx.restaurant_has_item.create({
        data: {
          restaurant_id: restaurantId,
          item_id: newItem.id,
          current_price: itemData.basePrice,
          stock: initialStock,
          is_available: initialStock > 0,
        },
      });

      // 3. Liaison optionnelle au menu
      if (menuId) {
        await tx.menu_has_item.create({
          data: {
            menu_id: menuId,
            item_id: newItem.id,
          },
        });
      }

      return newItem;
    });
  },

  async getItemsByCategory(category: ItemCategory, restaurantId?: number) { // category est maintenant typé comme ItemCategory
    return await prisma.item.findMany({
      where: { 
        category, // Utilisation directe de l'enum
        ...(restaurantId && {
          restaurant_has_item: { some: { restaurant_id: restaurantId } }
        })
      },
      include: {
        restaurant_has_item: true
      }
    });
  },

  async getItemById(id: number) {
  return await prisma.item.findUnique({
    where: { id },
    include: {
      restaurant_has_item: true, // Infos stock/prix par restaurant
      menu_has_item: {          // Menus contenant cet item
        include: {
          menu: true
        }
      }
    }
  });
},

async updateItem(
  itemId: number,
  updateData: {
    name?: string;
    description?: string | null;
    category?: ItemCategory;
    basePrice?: number;
  }
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Mettre à jour l'item
    const updatedItem = await tx.item.update({
      where: { id: itemId },
      data: {
        name: updateData.name,
        description: updateData.description,
        category: updateData.category,
        base_price: updateData.basePrice
      }
    });

    // 2. Mettre à jour le prix dans restaurant_has_item si basePrice change
    if (updateData.basePrice !== undefined) {
      await tx.restaurant_has_item.updateMany({
        where: { item_id: itemId },
        data: { current_price: updateData.basePrice }
      });
    }

    return updatedItem;
  });
},

async deleteItem(itemId: number, restaurantId: number) {
  return await prisma.$transaction(async (tx) => {
    // 1. Vérifier que l'item appartient bien au restaurant
    const restaurantItem = await tx.restaurant_has_item.findUnique({
      where: { 
        restaurant_id_item_id: { 
          restaurant_id: restaurantId, 
          item_id: itemId 
        } 
      }
    });

    if (!restaurantItem) {
      throw new NotFoundError("Item not found in this restaurant");
    }

    // 2. Supprimer les liaisons spécifiques à ce restaurant
    await tx.restaurant_has_item.delete({
      where: { 
        restaurant_id_item_id: { 
          restaurant_id: restaurantId, 
          item_id: itemId 
        } 
      }
    });

    // 3. Vérifier si l'item est utilisé dans d'autres restaurants
    const otherRestaurants = await tx.restaurant_has_item.findMany({
      where: { 
        item_id: itemId,
        NOT: { restaurant_id: restaurantId }
      }
    });

    // 4. Si l'item n'est utilisé nulle part ailleurs, le supprimer complètement
    if (otherRestaurants.length === 0) {
      await tx.menu_has_item.deleteMany({
        where: { item_id: itemId }
      });

      return await tx.item.delete({
        where: { id: itemId }
      });
    }

    // Retourner l'item même s'il n'a pas été supprimé (car utilisé ailleurs)
    return await tx.item.findUnique({ where: { id: itemId } });
  });
}
};