"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.ItemService = {
    async createItemWithRestaurantLink(itemData, restaurantId, options) {
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
    async getItemsByCategory(category, restaurantId) {
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
    async getItemById(id) {
        return await prisma.item.findUnique({
            where: { id },
            include: {
                restaurant_has_item: true, // Infos stock/prix par restaurant
                menu_has_item: {
                    include: {
                        menu: true
                    }
                }
            }
        });
    },
    async updateItem(itemId, updateData, restaurantId // Paramètre maintenant obligatoire
    ) {
        return await prisma.$transaction(async (tx) => {
            // 1. Mise à jour de l'item
            const updatedItem = await tx.item.update({
                where: { id: itemId },
                data: {
                    name: updateData.name,
                    description: updateData.description,
                    category: updateData.category,
                    base_price: updateData.basePrice
                }
            });
            // 2. Mise à jour du prix spécifique au restaurant
            if (updateData.basePrice !== undefined) {
                await tx.restaurant_has_item.updateMany({
                    where: {
                        item_id: itemId,
                        restaurant_id: restaurantId
                    },
                    data: { current_price: updateData.basePrice }
                });
            }
            return updatedItem;
        });
    },
    async deleteItem(itemId, restaurantId) {
        await prisma.$transaction([
            // Supprime la liaison restaurant-item
            prisma.restaurant_has_item.delete({
                where: {
                    restaurant_id_item_id: {
                        restaurant_id: restaurantId,
                        item_id: itemId
                    }
                }
            }),
            // Supprime l'item s'il n'est plus lié à aucun restaurant
            prisma.item.deleteMany({
                where: {
                    id: itemId,
                    restaurant_has_item: { none: {} }
                }
            })
        ]);
    }
};
