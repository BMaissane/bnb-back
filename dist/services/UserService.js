"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const authUtils_1 = require("../utils/authUtils");
const client_1 = require("../prisma/client");
class UserService {
    static async createUser(dto) {
        const { password, ...rest } = dto;
        return client_1.prisma.user.create({
            data: {
                email: rest.email,
                password_hash: await (0, authUtils_1.hashPassword)(password),
                first_name: rest.firstName, // Conversion camelCase → snake_case
                last_name: rest.lastName,
                phone_number: rest.phoneNumber, // Champ optionnel
                type_user: rest.type
            },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                type_user: true
            }
        });
    }
    static async getUserById(id) {
        return client_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                type_user: true,
            }
        });
    }
    static async getUserByEmail(email) {
        return client_1.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password_hash: true, // Nécessaire pour l'authentification
                type_user: true
            }
        });
    }
    static async getUserByIdWithPassword(id) {
        return client_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                password_hash: true, // On a besoin du hash pour vérification
                // ... autres champs si nécessaire
            }
        });
    }
    static async updateUser(id, dto) {
        return client_1.prisma.user.update({
            where: { id },
            data: {
                first_name: dto.firstName,
                last_name: dto.lastName,
                phone_number: dto.phoneNumber
            },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                type_user: true
            }
        });
    }
    static async deleteUser(id) {
        return client_1.prisma.user.delete({
            where: { id }
        });
    }
}
exports.UserService = UserService;
