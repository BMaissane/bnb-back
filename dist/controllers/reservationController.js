"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationController = void 0;
const reservationService_1 = require("../services/reservationService");
const errors_1 = require("../middleware/errors");
const client_1 = __importDefault(require("../prisma/client"));
exports.ReservationController = {
    async create(req, res, next) {
        try {
            const reservation = await reservationService_1.ReservationService.create(req.body);
            res.status(201).json(reservation);
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const userId = req.user.id;
            const reservation = await reservationService_1.ReservationService.getById(id);
            res.json(reservation);
        }
        catch (error) {
            next(error);
        }
    },
    async getByUser(req, res, next) {
        try {
            const userId = parseInt(req.params.userId);
            // Vérification des droits
            if (userId !== req.user.id && req.user.type_user !== 'RESTAURANT_OWNER') {
                return res.status(403).json({
                    error: 'Accès non autorisé',
                    code: 'FORBIDDEN'
                });
            }
            const reservations = await reservationService_1.ReservationService.getByUserId(userId);
            res.json(reservations);
        }
        catch (error) {
            next(error);
        }
    },
    // reservationController.ts - getByRestaurant
    async getByRestaurant(req, res, next) {
        try {
            const restaurantId = Number(req.params.id); // Note: 'id' si votre route est '/:id/reservations'
            const userId = req.user.id;
            console.log(`[ReservationController] Fetching reservations for restaurant ${restaurantId} by user ${userId}`);
            if (isNaN(restaurantId)) {
                throw new errors_1.NotFoundError("ID de restaurant invalide");
            }
            // Vérifier que le restaurant existe et appartient à l'utilisateur
            const restaurant = await client_1.default.restaurant.findUnique({
                where: { id: restaurantId, owner_id: userId },
                select: { id: true }
            });
            if (!restaurant) {
                throw new errors_1.NotFoundError("Restaurant non trouvé ou non autorisé");
            }
            const reservations = await reservationService_1.ReservationService.getAllRestaurantReservations(restaurantId);
            console.log(`[ReservationController] Found ${reservations.length} reservations`);
            res.json(reservations);
        }
        catch (error) {
            console.error('[ReservationController] Error in getByRestaurant:', error);
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            console.log('UPDATE BODY:', req.body); // Debug
            const id = Number(req.params.id);
            if (isNaN(id))
                throw new Error('ID invalide');
            const updated = await reservationService_1.ReservationService.update(id, req.body);
            res.json(updated);
        }
        catch (error) {
            next(error);
        }
    },
    async cancel(req, res, next) {
        try {
            console.log('CANCEL BODY:', req.body); // Debug
            const id = Number(req.params.id);
            const updated = await reservationService_1.ReservationService.cancel(id, req.body.reason);
            res.json(updated);
        }
        catch (error) {
            next(error);
        }
    }
};
