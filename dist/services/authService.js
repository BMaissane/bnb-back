"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
class AuthService {
    static async registerUser(email, password, name, isRestaurateur) {
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const userType = isRestaurateur ? client_1.UserType.RESTAURANT_OWNER : client_1.UserType.CLIENT;
        return prisma.user.create({
            data: {
                email,
                password_hash: hashedPassword,
                first_name: name,
                last_name: "",
                type_user: userType
            }
        });
    }
    static async loginUser(email, password) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new Error('Utilisateur non trouvé');
        const isValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValid)
            throw new Error('Mot de passe incorrect');
        return user;
    }
    static generateToken(user) {
        return jsonwebtoken_1.default.sign({ id: user.id, type_user: user.type_user }, process.env.JWT_SECRET, { expiresIn: '24h' });
    }
}
exports.AuthService = AuthService;
