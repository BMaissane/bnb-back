import { Prisma } from '@prisma/client';
import { CreateMenuDto, UpdateMenuDto } from '../interface/dto/menuDto';
import { prisma } from '../prisma/client';
import { HttpException } from '../exception/httpException';

export class MenuService {
  static getMenuWithItems(arg0: number) {
      throw new Error('Method not implemented.');
  }
  static async createMenu(dto: CreateMenuDto) {
    try {
      return await prisma.$transaction(async (prisma) => {
        // 1. Créez d'abord le menu
        const menu = await prisma.menu.create({
          data: {
            restaurant_id: dto.restaurantId,
            name: dto.name,
            description: dto.description,
            is_active: dto.isActive
          }
        });

        // 2. Créez les items séparément si besoin
        if (dto.items && dto.items.length > 0) {
          await prisma.item.createMany({
            data: dto.items.map(item => ({
              menu_id: menu.id,
              name: item.name,
              description: item.description,
              category: item.category,
              price: item.price,
              stock: item.stock
            }))
          });
        }

        // 3. Récupérez le menu avec ses items
        return prisma.menu.findUnique({
          where: { id: menu.id },
          include: { items: true }
        });
      });
    } catch (error) {
      // ... gestion d'erreurs existante
    }
  }
}