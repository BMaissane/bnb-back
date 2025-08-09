"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.RestaurantService = {
    async createRestaurant(data) {
        return prisma.restaurant.create({
            data: {
                ...data,
                opening_hours: data.opening_hours,
                image_url: data.image_url || 'https://example.com/placeholder.jpg',
                is_active: true
            }
        });
    },
    async getRestaurantById(id) {
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
            select: {
                id: true,
                name: true,
                description: true,
                image_url: true,
                genre: true,
                _count: {
                    select: { menu: { where: { is_active: true } } }
                }
            }
        });
    },
    async getRestaurantsByOwner(ownerId) {
        return prisma.restaurant.findMany({
            where: { owner_id: ownerId },
            include: {
                menu: true,
                timeslot: true,
                reservation: true
            }
        });
    },
    async updateRestaurant(id, data) {
        return prisma.restaurant.update({
            where: { id },
            data: {
                ...data,
                opening_hours: data.opening_hours,
                updated_at: new Date()
            }
        });
    },
    async deleteRestaurant(id) {
        console.log(`Suppression du restaurant ${id}`);
        return prisma.restaurant.delete({
            where: { id },
        });
    },
    async searchRestaurants(query) {
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
