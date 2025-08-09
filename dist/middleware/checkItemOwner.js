"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkItemOwner = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("./errors");
const prisma = new client_1.PrismaClient();
const checkItemOwner = async (req, res, next) => {
    try {
        if (!req.user)
            throw new errors_1.ForbiddenError('Authentification requise');
        const itemId = Number(req.params.id);
        if (isNaN(itemId))
            throw new errors_1.ForbiddenError('ID item invalide');
        // Vérification de l'ownership
        const itemRelation = await prisma.restaurant_has_item.findFirst({
            where: {
                item_id: itemId,
                restaurant: { owner_id: req.user.id }
            },
            select: { restaurant_id: true }
        });
        if (!itemRelation) {
            throw new errors_1.ForbiddenError("Vous ne possédez pas cet item");
        }
        // Assignation typée de restaurantId
        req.restaurantId = itemRelation.restaurant_id;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkItemOwner = checkItemOwner;
