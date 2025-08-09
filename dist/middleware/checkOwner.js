"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOwnership = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("./errors");
const prisma = new client_1.PrismaClient();
const checkOwnership = (resourceType) => {
    return async (req, res, next) => {
        try {
            if (!req.user)
                throw new errors_1.ForbiddenError('Authentification requise');
            const userId = req.user.id;
            // Debug log
            console.log(`[Ownership Check] User ${userId} trying to access ${resourceType}`, req.params);
            switch (resourceType) {
                case 'restaurant': {
                    const restaurantId = Number(req.params.id);
                    if (isNaN(restaurantId))
                        throw new errors_1.ForbiddenError('ID restaurant invalide');
                    const restaurant = await prisma.restaurant.findUnique({
                        where: { id: restaurantId },
                        select: { owner_id: true }
                    });
                    if (!restaurant)
                        throw new errors_1.NotFoundError("Restaurant non trouvé");
                    if (restaurant.owner_id !== userId)
                        throw new errors_1.ForbiddenError("Action non autorisée");
                    break;
                }
                case 'menu': {
                    const menuId = Number(req.params.id);
                    if (isNaN(menuId))
                        throw new errors_1.ForbiddenError('ID menu invalide');
                    const menu = await prisma.menu.findUnique({
                        where: { id: menuId },
                        select: { restaurant: { select: { owner_id: true } } }
                    });
                    if (!menu)
                        throw new errors_1.NotFoundError("Menu non trouvé");
                    if (menu.restaurant.owner_id !== userId)
                        throw new errors_1.ForbiddenError("Action non autorisée");
                    break;
                }
                case 'timeslot': {
                    const timeslotId = Number(req.params.id);
                    const restaurantId = Number(req.params.restaurantId);
                    if (isNaN(timeslotId))
                        throw new errors_1.ForbiddenError('ID timeslot invalide');
                    if (isNaN(restaurantId))
                        throw new errors_1.ForbiddenError('ID restaurant invalide');
                    const timeslot = await prisma.timeslot.findUnique({
                        where: { id: timeslotId },
                        include: { restaurant: true }
                    });
                    if (!timeslot)
                        throw new errors_1.NotFoundError("Créneau non trouvé");
                    if (timeslot.restaurant.owner_id !== userId || timeslot.restaurant_id !== restaurantId) {
                        throw new errors_1.ForbiddenError("Action non autorisée");
                    }
                    break;
                }
                case 'reservation': {
                    const reservationId = Number(req.params.id);
                    if (isNaN(reservationId))
                        throw new errors_1.ForbiddenError('ID reservation invalide');
                    const reservation = await prisma.reservation.findUnique({
                        where: { id: reservationId },
                        select: {
                            user_id: true,
                            restaurant: { select: { owner_id: true } }
                        }
                    });
                    if (!reservation)
                        throw new errors_1.NotFoundError("Réservation non trouvée");
                    if (reservation.user_id !== userId && reservation.restaurant.owner_id !== userId) {
                        throw new errors_1.ForbiddenError("Action non autorisée");
                    }
                    break;
                }
                case 'user': {
                    const targetUserId = Number(req.params.id);
                    if (isNaN(targetUserId))
                        throw new errors_1.ForbiddenError('ID user invalide');
                    if (targetUserId !== userId)
                        throw new errors_1.ForbiddenError("Action non autorisée");
                    break;
                }
                default:
                    throw new Error(`Type de ressource non supporté: ${resourceType}`);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.checkOwnership = checkOwnership;
