"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantController = void 0;
const restaurantDto_1 = require("../interface/dto/restaurantDto");
const restaurantService_1 = require("../services/restaurantService");
const client_1 = __importDefault(require("../prisma/client"));
const errors_1 = require("../interface/response/errors");
exports.RestaurantController = {
    // POST api/restaurants => :id
    async create(req, res, next) {
        try {
            // 1. Authentification
            if (!req.user)
                throw new Error('Authentication required');
            if (req.user.type_user !== 'RESTAURANT_OWNER') {
                throw new errors_1.ForbiddenError('Only restaurant owners can create establishments');
            }
            // 2. Validation complète avec Zod
            const validatedData = (0, restaurantDto_1.validateCreateRestaurant)({
                ...req.body,
                owner_id: req.user.id // Intégré dans la validation
            });
            // 3. Appel au service (les données sont maintenant validées)
            const restaurant = await restaurantService_1.RestaurantService.createRestaurant(validatedData);
            res.status(201).json(restaurant);
        }
        catch (error) {
            next(error);
        }
    },
    // GET api/restaurant
    async getAllRestaurants(req, res, next) {
        try {
            const restaurants = await restaurantService_1.RestaurantService.getAllRestaurants();
            if (restaurants.length === 0) {
                // Optionnel : retourner 200 avec tableau vide ou 404
                return res.status(200).json([]);
            }
            res.json(restaurants);
        }
        catch (error) {
            next(error);
        }
    },
    // GET api/restaurant/:id
    async getById(req, res, next) {
        try {
            const restaurant = await restaurantService_1.RestaurantService.getRestaurantById(Number(req.params.id));
            if (!restaurant)
                return res.status(404).json({ error: 'Restaurant not found' });
            res.json(restaurant);
        }
        catch (error) {
            next(error);
        }
    },
    // GET api/restaurant/owner/:id
    async getRestaurantsByOwner(req, res, next) {
        try {
            const { ownerId } = req.params;
            const restaurants = await restaurantService_1.RestaurantService.getRestaurantsByOwner(Number(ownerId));
            res.json(restaurants);
        }
        catch (error) {
            next(error);
        }
    },
    // PUT api/restaurant/:id
    async update(req, res, next) {
        try {
            const updated = await restaurantService_1.RestaurantService.updateRestaurant(Number(req.params.id), req.body);
            res.json(updated);
        }
        catch (error) {
            next(error);
        }
    },
    // DELETE api/restaurant/:id
    async delete(req, res, next) {
        try {
            const restaurantId = Number(req.params.id);
            console.log(`Tentative de suppression du restaurant ${restaurantId}`);
            const beforeDelete = await client_1.default.restaurant.findUnique({
                where: { id: restaurantId }
            });
            console.log('Avant suppression:', beforeDelete);
            await restaurantService_1.RestaurantService.deleteRestaurant(restaurantId);
            const afterDelete = await client_1.default.restaurant.findUnique({
                where: { id: restaurantId }
            });
            console.log('Après suppression:', afterDelete);
            res.status(204).send();
        }
        catch (error) {
            console.error('Erreur lors de la suppression:', error);
            next(error);
        }
    },
    // GET api/restaurant
    async search(req, res, next) {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ error: 'Search query is required' });
            }
            const restaurants = await restaurantService_1.RestaurantService.searchRestaurants(q.toString());
            res.json(restaurants);
        }
        catch (error) {
            next(error);
        }
    }
};
