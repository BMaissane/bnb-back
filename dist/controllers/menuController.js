"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuController = void 0;
const menuService_1 = require("../services/menuService");
const menuDto_1 = require("../interface/dto/menuDto");
const client_1 = __importDefault(require("../prisma/client"));
const errors_1 = require("../middleware/errors");
exports.menuController = {
    // POST api/restaurant/:id/menu
    async createMenu(req, res, next) {
        try {
            // 1. Vérification du type d'utilisateur
            if (req.user?.type_user !== 'RESTAURANT_OWNER') {
                throw new errors_1.ForbiddenError('Accès réservé aux restaurateurs');
            }
            // 2. Récupération d'un restaurant du propriétaire
            const restaurant = await client_1.default.restaurant.findFirst({
                where: { owner_id: req.user.id },
                select: { id: true }
            });
            if (!restaurant) {
                throw new errors_1.ForbiddenError('Aucun restaurant associé à votre compte');
            }
            // 3. Validation et injection du restaurantId
            const validatedData = {
                ...menuDto_1.CreateMenuSchema.parse(req.body),
                restaurantId: restaurant.id
            };
            const menu = await menuService_1.MenuService.createMenu(validatedData);
            res.status(201).json(menu);
        }
        catch (error) {
            next(error);
        }
    },
    // GET /api/restaurants/:id/menus
    async getMenusByRestaurant(req, res, next) {
        try {
            const restaurantId = Number(req.params.id);
            if (isNaN(restaurantId)) {
                throw new errors_1.NotFoundError("ID de restaurant invalide");
            }
            // Vérifier que le restaurant existe
            const restaurantExists = await client_1.default.restaurant.findUnique({
                where: { id: restaurantId },
                select: { id: true }
            });
            if (!restaurantExists) {
                throw new errors_1.NotFoundError("Restaurant non trouvé");
            }
            const menus = await menuService_1.MenuService.getMenusByRestaurant(restaurantId);
            res.json(menus);
        }
        catch (error) {
            next(error);
        }
    },
    // GET /api/restaurants/:id/menus/:id
    async getMenuById(req, res, next) {
        try {
            const menuId = Number(req.params.id);
            if (isNaN(menuId)) {
                throw new errors_1.NotFoundError("ID de menu invalide"); // Utilisez BadRequestError au lieu de NotFoundError
            }
            const menu = await client_1.default.menu.findUnique({
                where: { id: menuId },
                include: {
                    menu_has_item: {
                        include: {
                            item: {
                                select: {
                                    id: true,
                                    name: true,
                                    base_price: true
                                }
                            }
                        }
                    }
                }
            });
            if (!menu) {
                throw new errors_1.NotFoundError("Menu non trouvé"); // C'est ici qu'il faut vérifier
            }
            res.json(menu);
        }
        catch (error) {
            next(error);
        }
    },
    // PUT api/restaurants/:id/menus/:id
    async updateMenu(req, res, next) {
        try {
            const menuId = Number(req.params.id);
            if (isNaN(menuId)) {
                throw new errors_1.NotFoundError("ID de menu invalide");
            }
            // Validation des données (Zod)
            const validatedData = menuDto_1.UpdateMenuSchema.parse(req.body);
            // Appel au service (pas besoin de restaurantId, vérifié par checkOwnership)
            const updatedMenu = await menuService_1.MenuService.updateMenu(menuId, validatedData);
            res.json(updatedMenu);
        }
        catch (error) {
            next(error);
        }
    },
    // DELETE api/restaurant/:id/menu/:id
    async deleteMenu(req, res, next) {
        try {
            const menuId = Number(req.params.id);
            if (isNaN(menuId)) {
                throw new errors_1.NotFoundError("ID de menu invalide");
            }
            await menuService_1.MenuService.deleteMenu(menuId);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
};
