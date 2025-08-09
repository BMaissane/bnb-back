"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeslotController = void 0;
const timeslotService_1 = require("../services/timeslotService");
const client_1 = __importDefault(require("../prisma/client"));
const errors_1 = require("../middleware/errors");
exports.TimeslotController = {
    // POST /timeslots
    async createTimeslot(req, res, next) {
        try {
            // Vérification unique et explicite
            if (!req.user)
                throw new Error('Unauthorized');
            // Validation des données
            if (!req.body.date || !req.body.start_at || !req.body.end_at) {
                throw new Error('Missing required fields');
            }
            const result = await timeslotService_1.TimeslotService.createTimeslot(Number(req.params.restaurantId), req.user.id, // On passe quand même l'ID pour le service
            {
                date: req.body.date,
                start_at: req.body.start_at,
                end_at: req.body.end_at,
                capacity: Number(req.body.capacity) || 10 // Valeur par défaut
            });
            res.status(201).json((0, timeslotService_1.formatTimeslot)(result));
        }
        catch (error) {
            next(error); // Gestion centralisée des erreurs
        }
    },
    // GET restaurants/restaurantID/timeslots
    async getByRestaurant(req, res, next) {
        try {
            // Conversion explicite vers le nom de champ Prisma
            const restaurantId = Number(req.params.restaurantId);
            if (isNaN(restaurantId)) {
                throw new Error("ID de restaurant invalide");
            }
            const filters = {
                restaurant_id: restaurantId, // Match avec le schéma Prisma
                ...(req.query.date && { date: new Date(req.query.date) })
            };
            const timeslots = await client_1.default.timeslot.findMany({
                where: filters,
                orderBy: [{ date: 'asc' }, { start_at: 'asc' }]
            });
            res.json(timeslots.map(timeslotService_1.formatTimeslot));
        }
        catch (error) {
            next(error);
        }
    },
    // GET /timeslots/:id
    async getById(req, res, next) {
        try {
            // Validation TypeScript
            const timeslotId = Number(req.params.id);
            const restaurantId = Number(req.params.restaurantId);
            if (isNaN(timeslotId)) { // Simplifier la validation
                throw new errors_1.NotFoundError('ID de créneau invalide');
            }
            const timeslot = await timeslotService_1.TimeslotService.getTimeslotById(timeslotId, restaurantId);
            res.json(timeslot);
        }
        catch (error) {
            next(error);
        }
    },
    // GET /timeslots/available/:restaurantId
    async getAvailable(req, res, next) {
        try {
            const restaurantId = Number(req.params.restaurantId);
            if (!restaurantId) {
                return res.status(400).json({ error: "ID restaurant requis" });
            }
            const timeslots = await timeslotService_1.TimeslotService.getAvailableTimeslots(restaurantId);
            res.json(timeslots);
        }
        catch (error) {
            next(error); // Transmet à votre errorHandler existant
        }
    },
    // PATCH /timeslots/:id
    async update(req, res, next) {
        try {
            const updated = await timeslotService_1.TimeslotService.updateTimeslot(Number(req.params.id), req.body // Transmet toutes les données brutes
            );
            res.json(updated); // Reçoit déjà des données formatées
        }
        catch (error) {
            next(error);
        }
    },
    // DELETE /timeslots/:id
    async delete(req, res, next) {
        try {
            const timeslotId = Number(req.params.id); // Paramètre doit s'appeler ':id'
            await timeslotService_1.TimeslotService.deleteTimeslot(timeslotId);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
};
