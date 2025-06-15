import { PrismaClient } from '@prisma/client';
import { CreateRestaurantDto, UpdateRestaurantDto } from '../interface/dto/restaurantDto';

const prisma = new PrismaClient();

export const RestaurantService = {
  async createRestaurant(data: CreateRestaurantDto) {
    return prisma.restaurant.create({
      data: {
        ...data,
        image_url: data.image_url || 'https://example.com/placeholder.jpg',
        is_active: true
      }
    });
  },

async getRestaurantById(id: number) {
  return prisma.restaurant.findUnique({
    where: { id },
    include: {
      menu: {
        include: {
          menu_has_item: {
            include: {
              item: true
            }
          }
        }
      },
      timeslot: true
    }
  });
},

async getAllRestaurants() {
  return prisma.restaurant.findMany({
    where: { is_active: true },
    include: {
      menu: {
        where: { is_active: true },
        include: {
          menu_has_item: {
            include: {
              item: true
            }
          }
        }
      }
    }
  });
},

  async getRestaurantsByOwner(ownerId: number) {
    return prisma.restaurant.findMany({
      where: { owner_id: ownerId },
      include: {
        menu: true,
        timeslot: true,
        reservation: true
      }
    });
  },

  async updateRestaurant(id: number, data: UpdateRestaurantDto) {
    return prisma.restaurant.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      }
    });
  },

  // (soft-delete)
async deleteRestaurant(id: number) {
  console.log(`Suppression du restaurant ${id}`);
  return prisma.restaurant.delete({
    where: { id },
  });
},

  async searchRestaurants(query: string) {
    return prisma.restaurant.findMany({
      where: {
        is_active: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { genre: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      }
    });
  }
};


