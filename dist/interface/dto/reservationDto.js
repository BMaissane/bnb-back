"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReservationSchema = exports.createReservationSchema = void 0;
const zod_1 = require("zod");
// Schéma pour la création d'une réservation
exports.createReservationSchema = zod_1.z.object({
    userId: zod_1.z.number().int().positive(),
    restaurantId: zod_1.z.number().int().positive(),
    timeslotId: zod_1.z.number().int().positive(),
    specialRequests: zod_1.z.string().max(500).optional(),
    items: zod_1.z.array(zod_1.z.object({
        itemId: zod_1.z.number().int().positive(),
        quantity: zod_1.z.number().int().positive().min(1).max(10),
    })).min(1, "Au moins un item est requis"),
});
// Schéma pour la mise à jour d'une réservation
exports.updateReservationSchema = zod_1.z.object({
    status: zod_1.z.enum(['CONFIRMED', 'CANCELED']),
    specialRequests: zod_1.z.string().max(500).optional(),
});
