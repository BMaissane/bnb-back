"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemController = void 0;
const itemCategory_1 = require("../@types/express/itemCategory");
const zod_1 = require("zod");
const itemService_1 = require("../services/itemService");
const errors_1 = require("../middleware/errors");
const createItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional().nullable(), // Explicitement optionnel et nullable
    category: zod_1.z.nativeEnum(itemCategory_1.ItemCategory),
    basePrice: zod_1.z.number().positive(),
    restaurantId: zod_1.z.number().int().positive(),
    initialStock: zod_1.z.number().int().min(0).optional().default(0),
});
const updateItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional().nullable(),
    category: zod_1.z.nativeEnum(itemCategory_1.ItemCategory).optional(),
    restaurantId: zod_1.z.number().int().positive(),
    basePrice: zod_1.z.number().positive().optional()
});
exports.ItemController = {
    // POST api/items
    async createItem(req, res, next) {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            // Validation des données
            const validatedData = createItemSchema.parse(req.body);
            const item = await itemService_1.ItemService.createItemWithRestaurantLink({
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                basePrice: req.body.basePrice
            }, req.body.restaurantId, {
                menuId: req.body.menuId, // Optionnel
                initialStock: req.body.initialStock // Optionnel
            });
            ;
            res.status(201).json(item);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.errors });
            }
            next(error);
        }
    },
    // GET api/items/:id
    async getItemById(req, res, next) {
        try {
            const { id } = req.params;
            // Validation basique de l'ID
            if (isNaN(Number(id))) {
                return res.status(400).json({ error: "ID must be a number" });
            }
            const item = await itemService_1.ItemService.getItemById(Number(id));
            if (!item) {
                return res.status(404).json({ error: "Item not found" });
            }
            res.status(200).json({
                ...item,
                // Formattage optionnel pour le frontend
                availability: item.restaurant_has_item.map(rhi => ({
                    restaurantId: rhi.restaurant_id,
                    price: rhi.current_price,
                    stock: rhi.stock
                }))
            });
        }
        catch (error) {
            next(error);
        }
    },
    // PATCH /api/items/:id
    async updateItem(req, res, next) {
        try {
            const itemId = Number(req.params.id);
            const restaurantId = req.restaurantId; // TypeScript sait maintenant que cette propriété existe
            if (!restaurantId) {
                throw new errors_1.NotFoundError('restaurantId non défini');
            }
            const validatedData = updateItemSchema.parse(req.body);
            const updatedItem = await itemService_1.ItemService.updateItem(itemId, validatedData, restaurantId);
            res.json(updatedItem);
        }
        catch (error) {
            next(error);
        }
    },
    // DELETE /api/items/:id
    async deleteItem(req, res, next) {
        try {
            const itemId = Number(req.params.id);
            const restaurantId = req.restaurantId;
            if (!restaurantId) {
                throw new errors_1.NotFoundError('restaurantId non défini');
            }
            await itemService_1.ItemService.deleteItem(itemId, restaurantId);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }
};
