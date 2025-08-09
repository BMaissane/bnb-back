"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateRestaurant = exports.validateCreateRestaurant = exports.UpdateRestaurantSchema = exports.CreateRestaurantSchema = void 0;
// src/dto/restaurant.dto.ts
const zod_1 = require("zod");
// 1. Schéma de validation pour les horaires
const timeSlotSchema = zod_1.z.object({
    open: zod_1.z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    close: zod_1.z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
}).refine(data => data.open < data.close, {
    message: "L'heure de fermeture doit être après l'ouverture"
});
const openingHoursSchema = zod_1.z.record(zod_1.z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']), zod_1.z.array(timeSlotSchema).optional());
// 2. Schémas Zod pour les DTOs
exports.CreateRestaurantSchema = zod_1.z.object({
    owner_id: zod_1.z.number().int().positive(),
    name: zod_1.z.string().min(2).max(100),
    address: zod_1.z.string().max(255).optional(),
    opening_hours: openingHoursSchema.optional(),
    genre: zod_1.z.string().max(50).optional(),
    siret: zod_1.z.string().length(14).regex(/^\d+$/),
    description: zod_1.z.string().max(500).optional(),
    image_url: zod_1.z.string().url().optional()
});
exports.UpdateRestaurantSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    address: zod_1.z.string().max(255).optional(),
    opening_hours: openingHoursSchema.optional(),
    genre: zod_1.z.string().max(50).optional(),
    description: zod_1.z.string().max(500).optional(),
    image_url: zod_1.z.string().url().optional(),
    is_active: zod_1.z.boolean().optional()
});
// 4. Fonctions de validation
const validateCreateRestaurant = (data) => exports.CreateRestaurantSchema.parse(data);
exports.validateCreateRestaurant = validateCreateRestaurant;
const validateUpdateRestaurant = (data) => exports.UpdateRestaurantSchema.parse(data);
exports.validateUpdateRestaurant = validateUpdateRestaurant;
