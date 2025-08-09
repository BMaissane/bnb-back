"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMenuSchema = exports.CreateMenuSchema = void 0;
const zod_1 = require("zod");
// Enum pour les catégories
const CategoryEnum = zod_1.z.enum(["STARTER", "MAIN", "DESSERT", "SIDE", "DRINK"]);
// Schéma de base pour un item
const MenuItemSchema = zod_1.z.object({
    id: zod_1.z.number().optional(), // Important pour l'update
    name: zod_1.z.string().min(1, "Le nom est requis"),
    description: zod_1.z.string().optional(),
    category: CategoryEnum,
    price: zod_1.z.number().min(0, "Le prix doit être positif"),
    stock: zod_1.z.number().min(0).optional().default(0)
});
// Schéma pour la création
exports.CreateMenuSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Le nom est requis"),
    description: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional().default(true),
    items: zod_1.z.array(MenuItemSchema.omit({ id: true })).optional() // On exclut id pour la création
});
// Schéma pour la mise à jour
exports.UpdateMenuSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Le nom est requis").optional(),
    description: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    items: zod_1.z.array(MenuItemSchema).optional() // On inclut id optionnel pour l'update
});
