"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessRuleError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
class UnauthorizedError extends AppError {
    constructor(message = 'Non autorisé') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Accès refusé') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Ressource non trouvée') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class BusinessRuleError extends AppError {
    constructor(message = 'Règle métier non respectée') {
        super(message, 422);
        this.name = 'BusinessRuleError';
    }
}
exports.BusinessRuleError = BusinessRuleError;
