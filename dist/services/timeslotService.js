"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeslotService = exports.formatTimeslot = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../middleware/errors");
const prisma = new client_1.PrismaClient();
// Helper pour le formatage des dates (exemple existant)
const formatTimeslot = (timeslot) => ({
    ...timeslot,
    date: timeslot.date.toISOString().split('T')[0],
    start_at: timeslot.start_at.toISOString().split('T')[1].slice(0, 5),
    end_at: timeslot.end_at.toISOString().split('T')[1].slice(0, 5)
});
exports.formatTimeslot = formatTimeslot;
// Helper interne pour la gestion des dates
function prepareDateTimeUpdates(data, current) {
    const updateData = {};
    const dateToUse = data.date || current.date.toISOString().split('T')[0];
    if (data.date) {
        updateData.date = new Date(data.date);
        if (!data.start_at) {
            updateData.start_at = new Date(`${data.date}T${current.start_at.toISOString().split('T')[1]}`);
        }
        if (!data.end_at) {
            updateData.end_at = new Date(`${data.date}T${current.end_at.toISOString().split('T')[1]}`);
        }
    }
    if (data.start_at) {
        updateData.start_at = new Date(`${dateToUse}T${data.start_at}`);
    }
    if (data.end_at) {
        updateData.end_at = new Date(`${dateToUse}T${data.end_at}`);
    }
    return updateData;
}
exports.TimeslotService = {
    // POST /timeslots
    // Dans TimeslotService.createTimeslot
    async createTimeslot(restaurantId, userId, data) {
        const now = new Date();
        const startAt = new Date(`${data.date}T${data.start_at}`);
        const endAt = new Date(`${data.date}T${data.end_at}`);
        // Validation temporelle stricte
        if (startAt < now) {
            throw new Error('TIMESLOT_IN_PAST');
        }
        // Validation cohérence créneau
        if (startAt >= endAt) {
            throw new Error('INVALID_TIME_RANGE');
        }
        return await prisma.$transaction(async (tx) => {
            const timeslot = await tx.timeslot.create({
                data: {
                    restaurant_id: restaurantId,
                    date: new Date(data.date),
                    start_at: startAt,
                    end_at: endAt,
                    capacity: data.capacity,
                    status: 'AVAILABLE'
                }
            });
            // // Double vérification après création
            // if (new Date(timeslot.start_at) < new Date()) {
            //   await tx.timeslot.delete({ where: { id: timeslot.id } });
            //   throw new Error('TIMESLOT_IN_PAST_AFTER_CREATION');
            // }
            return timeslot;
        });
    },
    // GET BY RESTAURANT_ID
    async getRestaurantTimeslots(restaurantId, filters) {
        console.log('[SERVICE] restaurantId reçu:', restaurantId); // Log de debug
        if (!restaurantId || isNaN(restaurantId)) {
            throw new Error("Invalid restaurant ID");
        }
        const whereClause = {
            restaurant_id: restaurantId // Assurez-vous que le nom correspond exactement à votre schéma Prisma
        };
        if (filters?.date) {
            whereClause.date = new Date(filters.date);
        }
        if (filters?.status) {
            whereClause.status = filters.status;
        }
        return await prisma.timeslot.findMany({
            where: whereClause,
            orderBy: [
                { date: 'asc' },
                { start_at: 'asc' }
            ]
        }).then(timeslots => timeslots.map(exports.formatTimeslot));
    },
    // GET BY ID
    async getTimeslotById(timeslotId, restaurantId) {
        return await prisma.timeslot.findUnique({
            where: {
                id: timeslotId,
                ...(restaurantId && { restaurant_id: restaurantId })
            }
        }).then(timeslot => timeslot ? (0, exports.formatTimeslot)(timeslot) : null);
    },
    // GET ONLY AVAIABLE TIMESLOTS
    async getAvailableTimeslots(restaurantId) {
        const timeslots = await prisma.timeslot.findMany({
            where: {
                restaurant_id: restaurantId,
                status: 'AVAILABLE'
            },
            orderBy: { start_at: 'asc' }
        });
        if (timeslots.length === 0) {
            throw new errors_1.NotFoundError('Aucun créneau disponible trouvé');
        }
        return timeslots;
    },
    // PATCH/UPDATE
    async updateTimeslot(timeslotId, data) {
        return await prisma.$transaction(async (prisma) => {
            const current = await prisma.timeslot.findUniqueOrThrow({
                where: { id: timeslotId }
            });
            // 1. Gestion prioritaire de UNAVAILABLE
            if (data.status === 'UNAVAILABLE') {
                return await prisma.timeslot.update({
                    where: { id: timeslotId },
                    data: {
                        ...data,
                        status: 'UNAVAILABLE',
                        ...prepareDateTimeUpdates(data, current)
                    }
                }).then(exports.formatTimeslot);
            }
            // 2. Logique métier
            const newCapacity = data.capacity ?? current.capacity;
            let newStatus = data.status ?? current.status;
            if (newCapacity <= 0 && current.status !== 'UNAVAILABLE') {
                newStatus = 'BOOKED';
            }
            else if (newCapacity > 0 && current.status === 'BOOKED') {
                newStatus = 'AVAILABLE';
            }
            // 3. Mise à jour finale
            return await prisma.timeslot.update({
                where: { id: timeslotId },
                data: {
                    capacity: newCapacity,
                    status: newStatus,
                    ...prepareDateTimeUpdates(data, current)
                }
            }).then(exports.formatTimeslot);
        });
    },
    //DELETE
    async deleteTimeslot(timeslotId) {
        return await prisma.timeslot.delete({
            where: { id: timeslotId }
        }).then(() => ({ message: "Timeslot deleted successfully" }));
    }
};
