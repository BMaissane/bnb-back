"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const errors_1 = require("./errors");
const errorHandler = (err, req, res, next) => {
    console.error('[Error Handler]', err);
    // Erreurs Prisma
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({
            error: 'Database error',
            code: err.code,
            meta: err.meta,
            type: 'PRISMA_ERROR'
        });
    }
    // Erreurs annulation 24h max avant réservation
    if (err instanceof errors_1.BusinessRuleError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: 'BUSINESS_RULE_VIOLATION'
        });
    }
    // Erreurs Zod
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: 'Validation error',
            details: err.errors.map(e => ({
                path: e.path.join('.'),
                message: e.message
            })),
            type: 'VALIDATION_ERROR'
        });
    }
    // Erreurs métiers personnalisées
    switch (err.constructor) {
        case errors_1.UnauthorizedError:
            return res.status(401).json({
                error: err.message,
                code: 'UNAUTHORIZED',
                type: 'AUTH_ERROR'
            });
        case errors_1.ForbiddenError:
            return res.status(403).json({
                error: err.message,
                code: 'FORBIDDEN',
                type: 'AUTH_ERROR'
            });
        case errors_1.NotFoundError:
            return res.status(404).json({
                error: err.message,
                code: 'NOT_FOUND',
                type: 'RESOURCE_ERROR'
            });
        default:
            // Gestion des messages d'erreur spécifiques
            if (err.message.includes("ne peut pas être dans le passé")) {
                return res.status(400).json({
                    error: err.message,
                    code: 'PAST_DATE_NOT_ALLOWED',
                    type: 'BUSINESS_RULE_ERROR'
                });
            }
            // Erreur serveur inattendue
            return res.status(500).json({
                error: 'Internal Server Error',
                code: 'SERVER_ERROR',
                type: 'UNEXPECTED_ERROR',
                details: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
    }
};
exports.errorHandler = errorHandler;
