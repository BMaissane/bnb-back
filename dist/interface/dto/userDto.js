"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserSchema = exports.UpdateUserSchema = exports.CreateUserSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
// Schéma de validation avec Zod
// interfaces/dto/user.dto.ts
exports.CreateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    phoneNumber: zod_1.z.string().regex(/^\+?[\d\s]+$/).optional().nullable(),
    type: zod_1.z.nativeEnum(client_1.UserType).default('CLIENT')
});
exports.UpdateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).optional(),
    lastName: zod_1.z.string().min(2).optional(),
    phoneNumber: zod_1.z.string().regex(/^\+?[0-9\s]+$/).optional()
}).strict(); // .strict() empêche les champs non déclarés
exports.DeleteUserSchema = zod_1.z.object({
    password: zod_1.z.string().min(8) // Pour confirmation par mot de passe
});
