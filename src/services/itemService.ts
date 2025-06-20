import { ItemCategory, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class ItemService {
  async createItemWithRestaurantLink(
    name: string,
    description: string,
    ItemCategory : ItemCategory,
    basePrice: number,
    restaurantId: number,
    initialStock: number = 0
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Créer l'article (item)
      const newItem = await tx.item.create({
        data: {
          name,
          description,
          category : ItemCategory,
          base_price: basePrice,
        },
      });

      // 2. Lier l'article au restaurant (restaurant_has_item)
      await tx.restaurant_has_item.create({
        data: {
          restaurant_id: restaurantId,
          item_id: newItem.id,
          current_price: basePrice, // Prix identique au prix de base par défaut
          stock: initialStock,
          is_available: initialStock > 0,
        },
      });

      return newItem;
    });
  }
}

export default new ItemService();