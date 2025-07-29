import { Prisma } from '@prisma/client';
import { CreateMenuDto, UpdateMenuDto } from '../interface/dto/menuDto';
import { prisma } from '../prisma/client';
import { NotFoundError } from '../middleware/errors';

export const MenuService = {
  
async createMenu(data: CreateMenuDto) {
  return prisma.$transaction(async (tx) => {
    // 1. Création du menu
    const menu = await tx.menu.create({
      data: {
        restaurant_id: data.restaurantId,
        name: data.name,
        description: data.description,
        is_active: data.isActive ?? true
      }
    });

    // 2. Création des items (version corrigée)
    if (data.items?.length) {
      await Promise.all(data.items.map(async (itemData) => {
        const item = await tx.item.create({
          data: {
            name: itemData.name,
            description: itemData.description,
            category: itemData.category,
            base_price: new Prisma.Decimal(itemData.price),
            restaurant_has_item: {
              create: {
                restaurant_id: data.restaurantId,
                current_price: new Prisma.Decimal(itemData.price),
                stock: itemData.stock ?? 0
              }
            }
          }
        });

        await tx.menu_has_item.create({
          data: {
            menu_id: menu.id,
            item_id: item.id
          }
        });
      }));
    }

    // 3. Retour avec les relations
    return tx.menu.findUnique({
      where: { id: menu.id },
      include: {
        menu_has_item: { include: { item: true } },
        restaurant: { select: { name: true } }
      }
    });
  });
},

  async getMenuWithItems(id: number) {
    return prisma.menu.findUnique({
      where: { id },
      include: {
    menu_has_item: {
    include: {
      item: true
    }
  }
}
    });
  },


  async getMenuById(menuId: number, restaurantId?: number) {
  return await prisma.menu.findUnique({
    where: { 
      id: menuId,
      ...(restaurantId && { restaurant_id: restaurantId }) // Optionnel
    },
    include: { /* ... */ }
  });
},

async getMenusByRestaurant(restaurantId: number) {
  console.log(`[Debug] Fetching menus for restaurant ID: ${restaurantId}`); // <-- Ajoutez cette ligne
  
  const menus = await prisma.menu.findMany({
    where: { 
      restaurant_id: restaurantId,
      is_active: true
    },
    include: { 
      menu_has_item: { include: { item: true } } 
    }
  });

  console.log(`[Debug] Found ${menus.length} menus`); // <-- Log du résultat
  return menus;
}, 

async syncOrphanItemsToMenu(menuId: number) {
  // Trouver les items du restaurant non liés au menu
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: menuId }, // Suppose que menuId est lié à un restaurant
    include: {
      menu: { where: { id: menuId } },
      restaurant_has_item: {
        include: {
          item: {
            include: {
              menu_has_item: {
                where: { menu_id: menuId },
              },
            },
          },
        },
      },
    },
  });

  const orphanItems = restaurant?.restaurant_has_item.filter(
    (rhi) => rhi.item.menu_has_item.length === 0
  );

  if (orphanItems?.length) {
    await prisma.menu_has_item.createMany({
      data: orphanItems.map((item) => ({
        menu_id: menuId,
        item_id: item.item_id,
      })),
    });
  }
},

async updateMenu(menuId: number, data: UpdateMenuDto) {
  return prisma.$transaction(async (tx) => {
    // 1. Mise à jour du menu (pas de vérification owner/restaurant ici, géré par les middlewares)
    await tx.menu.update({
      where: { id: menuId },
      data: {
        name: data.name,
        description: data.description,
        is_active: data.isActive
      }
    });

    // 2. Gestion des items (uniquement si data.items est fourni)
    if (data.items) {
      // Suppression des anciennes associations
      await tx.menu_has_item.deleteMany({
        where: { menu_id: menuId }
      });

      // Création/Mise à jour des items et associations
      for (const itemData of data.items) {
        const item = await tx.item.upsert({
          where: { id: itemData.id ?? -1 }, // -1 force la création si id absent
          create: {
            name: itemData.name,
            description: itemData.description,
            category: itemData.category,
            base_price: new Prisma.Decimal(itemData.price)
          },
          update: {
            name: itemData.name,
            description: itemData.description,
            base_price: new Prisma.Decimal(itemData.price)
          }
        });

        // Lier l'item au menu
        await tx.menu_has_item.create({
          data: {
            menu_id: menuId,
            item_id: item.id
          }
        });
      }
    }

    // 3. Retourne le menu mis à jour avec ses items
    return tx.menu.findUnique({
      where: { id: menuId },
      include: {
        menu_has_item: { include: { item: true } }
      }
    });
  });
},

async deleteMenu(id: number) {
  return prisma.$transaction(async (tx) => {

    // Verif existingMenu
    const menu = await tx.menu.findUnique({ where: { id } });
    if (!menu) throw new Error("Menu non trouvé");

    // 1. Supprimer les associations menu_has_item (pour éviter les erreurs de clé étrangère)
    await tx.menu_has_item.deleteMany({
      where: { menu_id: id }
    });

    // 2. Supprimer le menu lui-même
    return tx.menu.delete({
      where: { id }
    });
  });
},


};