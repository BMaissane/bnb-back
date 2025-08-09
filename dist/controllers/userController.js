"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.createUser = void 0;
const UserService_1 = require("../services/UserService");
const client_1 = __importDefault(require("../prisma/client"));
const createUser = async (req, res) => {
    try {
        const userData = req.body;
        const user = await UserService_1.UserService.createUser(userData);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).json({ error: 'error.message' });
    }
};
exports.createUser = createUser;
const getUserById = async (req, res) => {
    const userId = parseInt(req.params.id);
    console.log("🔍 Recherche user ID:", userId);
    try {
        // Test DIRECT sans middleware
        const user = await client_1.default.user.findUnique({
            where: { id: userId },
            include: { restaurants: true } // Charge la relation pour debug
        });
        console.log("📦 Résultat Prisma:", user);
        if (!user) {
            console.log("❌ Utilisateur non trouvé");
            return res.status(404).json({ error: "User not found (debug)" });
        }
        res.json(user);
    }
    catch (error) {
        console.error("💥 Erreur:", error);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getUserById = getUserById;
// export const getUserById = async (req: Request, res: Response) => {
//   try {
//     const userId = parseInt(req.params.id);
//     if (isNaN(userId)) {
//       return res.status(400).json({ error: "ID invalide" });
//     }
//     console.log("Recherche de l'utilisateur ID:", userId);
//     const user = await UserService.getUserById(userId);
//     if (!user) {
//       console.log("Utilisateur non trouvé pour ID:", userId);
//       return res.status(404).json({ error: "Utilisateur non trouvé" });
//     }
//     console.log("Utilisateur trouvé:", user);
//     res.json(user);
//   } catch (error) {
//     console.error("Erreur:", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };
// PUT /api/users/:id
const updateUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const dto = req.body; // Utilisation directe du DTO
        // Conversion camelCase → snake_case
        const prismaData = {
            phone_number: dto.phoneNumber,
            last_name: dto.lastName // Maintenant reconnu via le DTO
        };
        console.log('Données transformées:', prismaData);
        const updatedUser = await client_1.default.user.update({
            where: { id: userId },
            data: prismaData,
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                phone_number: true
            }
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: 'Échec de la mise à jour' });
    }
};
exports.updateUser = updateUser;
// DELETE /api/users/:id
const deleteUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { password } = req.body;
        console.log('Tentative de suppression user ID:', userId);
        // 1. Vérifier que l'utilisateur existe
        const user = await client_1.default.user.findUnique({
            where: { id: userId },
            include: { restaurants: true } // Important pour les RESTAURANT_OWNER
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // 2. Vérifier les contraintes (si owner d'un restaurant)
        if (user.type_user === 'RESTAURANT_OWNER' && user.restaurants) {
            return res.status(400).json({
                error: 'Cannot delete restaurant owner with active restaurant'
            });
        }
        // 3. Suppression effective
        console.log('Exécution de la suppression...');
        await client_1.default.user.delete({
            where: { id: userId },
            include: { restaurants: true } // Pour le debug
        });
        console.log('Suppression réussie');
        res.status(204).send();
    }
    catch (error) {
        console.error('Erreur complète:', error);
        res.status(500).json({
            error: 'Delete failed',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.deleteUser = deleteUser;
