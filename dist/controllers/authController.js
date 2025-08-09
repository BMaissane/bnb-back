"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("../prisma/client");
const authUtils_1 = require("../utils/authUtils");
const mockEmail_1 = require("../utils/mockEmail");
const registerUser = async (req, res) => {
    try {
        const { email, password, name, lastName, isRestaurateur } = req.body;
        const user = await client_1.prisma.user.create({
            data: {
                email,
                password_hash: await bcryptjs_1.default.hash(password, 12),
                first_name: name,
                last_name: lastName || null,
                type_user: isRestaurateur ? 'RESTAURANT_OWNER' : 'CLIENT',
            },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true // Inclure dans la réponse
            }
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.error('Erreur d\'inscription:', error);
        res.status(400).json({ error: 'Échec de l\'inscription' });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        // Validation basique
        if (!req.body?.email || !req.body?.password) {
            return res.status(400).json({
                code: 'MISSING_CREDENTIALS',
                message: 'Email et mot de passe requis'
            });
        }
        const { email, password } = req.body;
        const user = await client_1.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password_hash: true,
                type_user: true
            }
        });
        if (!user) {
            return res.status(401).json({
                code: 'INVALID_CREDENTIALS',
                message: 'Identifiants incorrects'
            });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                code: 'INVALID_CREDENTIALS',
                message: 'Identifiants incorrects'
            });
        }
        // Vérification sécurité JWT
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET manquant dans .env');
            return res.status(500).json({
                code: 'SERVER_ERROR',
                message: 'Erreur de configuration serveur'
            });
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            type_user: user.type_user
        }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return res.json({
            token,
            userId: user.id,
            userType: user.type_user
        });
    }
    catch (error) {
        console.error('Erreur login:', error);
        return res.status(500).json({
            code: 'SERVER_ERROR',
            message: 'Erreur serveur'
        });
    }
};
exports.loginUser = loginUser;
// Fonction pour "mot de passe oublié"
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    // 1. Vérifier que l'utilisateur existe
    const user = await client_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(404).json({ error: "Aucun utilisateur trouvé avec cet email" });
    }
    // 2. Générer un token temporaire (ex: valable 1h)
    const resetToken = (0, authUtils_1.generateResetToken)(user.id);
    // 3. Stocker le token en base (ou cache)
    await client_1.prisma.user.update({
        where: { id: user.id },
        data: { resetToken }
    });
    // 4. Envoyer un email (mock en développement)
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    (0, mockEmail_1.sendMockEmail)(email, `Lien de réinitialisation : ${resetLink}`);
    res.json({ message: "Lien de réinitialisation envoyé (vérifiez les logs)" });
};
exports.forgotPassword = forgotPassword;
// Fonction pour réinitialiser le mot de passe
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    // 1. Vérifier le token
    const user = await client_1.prisma.user.findFirst({
        where: { resetToken: token }
    });
    if (!user) {
        return res.status(400).json({ error: "Token invalide ou expiré" });
    }
    // 2. Mettre à jour le mot de passe
    await client_1.prisma.user.update({
        where: { id: user.id },
        data: {
            password_hash: await (0, authUtils_1.hashPassword)(newPassword),
            resetToken: null // Invalider le token après usage
        }
    });
    res.json({ message: "Mot de passe réinitialisé avec succès" });
};
exports.resetPassword = resetPassword;
