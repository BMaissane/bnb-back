"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResetToken = exports.generateToken = exports.comparePasswords = exports.hashPassword = void 0;
exports.verifyPassword = verifyPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Configuration
const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';
const JWT_EXPIRES_IN = '24h';
/**
 * Hash un mot de passe
 */
const hashPassword = async (password) => {
    return bcrypt_1.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
/**
 * Compare un mot de passe avec son hash
 */
const comparePasswords = async (password, hashedPassword) => {
    return bcrypt_1.default.compare(password, hashedPassword);
};
exports.comparePasswords = comparePasswords;
async function verifyPassword(plainPassword, hash) {
    return await bcrypt_1.default.compare(plainPassword, hash);
}
// JWT Pour l'authentification standard (login)
const generateToken = (userId, type) => {
    return jsonwebtoken_1.default.sign({ userId, type }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
exports.generateToken = generateToken;
// JWT Pour la réinitialisation de mot de passe
const generateResetToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, // Pas besoin du type ici
    JWT_SECRET, { expiresIn: '1h' } // Durée courte
    );
};
exports.generateResetToken = generateResetToken;
