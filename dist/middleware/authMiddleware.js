"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("./errors");
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token)
            throw new errors_1.UnauthorizedError('Token manquant');
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Utilise directement l'interface globale
        next();
    }
    catch (error) {
        next(new errors_1.UnauthorizedError('Token invalide ou expiré'));
    }
};
exports.authenticate = authenticate;
const authorize = (allowedTypes) => {
    return (req, res, next) => {
        if (!allowedTypes.includes(req.user.type_user)) {
            return next(new errors_1.ForbiddenError('Rôle insuffisant'));
        }
        next();
    };
};
exports.authorize = authorize;
