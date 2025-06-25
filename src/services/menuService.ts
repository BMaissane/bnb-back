import { Prisma } from '@prisma/client';
import { CreateMenuDto, UpdateMenuDto } from '../interface/dto/menuDto';
import { prisma } from '../prisma/client';

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

      // 2. Création des items et liaison via menu_has_item
      if (data.items && data.items.length > 0) {
        for (const itemData of data.items) {
          // Création de l'item avec base_price
          const item = await tx.item.create({
            data: {
              name: itemData.name,
              description: itemData.description,
              category: itemData.category,
              base_price: new Prisma.Decimal(itemData.price), // Conversion en Decimal
              restaurant_has_item: {
                create: {
                  restaurant_id: data.restaurantId,
                  current_price: new Prisma.Decimal(itemData.price),
                  stock: itemData.stock ?? 0
                }
              }
            }
          });

          // Liaison au menu via menu_has_item
          await tx.menu_has_item.create({
            data: {
              menu_id: menu.id,
              item_id: item.id
            }
          });
        }
      }

      // 3. Retourne le menu avec ses items
      return tx.menu.findUnique({
        where: { id: menu.id },
        include: {
          menu_has_item: {
            include: {
              item: true
            }
          }
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
    return prisma.menu.findMany({
      where: { restaurant_id: restaurantId },
      include: {
      menu_has_item: {
      include: {
      item: {
        select: {
          id: true,
          name: true,
      
        } 
      }
    }
  }
}
    });
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

  async updateMenu(id: number, data: UpdateMenuDto) {
    return prisma.$transaction(async (tx) => {
      // 1. Mise à jour du menu
      await tx.menu.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          is_active: data.isActive
        }
      });

      // Appel à table de liaison menu_has_item
      if (data.items) {
        await tx.item.deleteMany(
          {where: {
           menu_has_item: {
    some: {
      menu_id: id 
    }
  }
}});
        await tx.item.createMany({
          data: data.items.map(item => ({
            menu_id: id,
            name: item.name,
            description: item.description,
            category: item.category,
            base_price: item.price,
            stock: item.stock ?? 0
          }))
        });
      }

      return this.getMenuWithItems(id);
    });
  },

  async deleteMenu(id: number) {
    return prisma.menu.delete({
      where: { id }
    });
    // La suppression en cascade des items sera gérée par Prisma via schema.prisma
  },


};