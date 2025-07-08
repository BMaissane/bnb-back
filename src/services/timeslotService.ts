import { TimeslotStatus } from '@prisma/client';
import prisma from '../prisma/client';

// Formattage date
export const formatTimeslot = (timeslot: any) => ({
  ...timeslot,
  date: timeslot.date.toISOString().split('T')[0],
  start_at: timeslot.start_at.toISOString().split('T')[1].slice(0, 5),
  end_at: timeslot.end_at.toISOString().split('T')[1].slice(0, 5)
});

export const TimeslotService = {
  async createTimeslot(restaurantId: number, userId: number, data: {
    date: string;
    start_at: string;
    end_at: string;
    capacity: number;
  }) {
    // Validation des dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slotDate = new Date(data.date);
    if (slotDate < today) {
      throw new Error("La date ne peut pas être dans le passé");
    }

    // Validation des heures
    const startTime = new Date(`${data.date}T${data.start_at}`);
    if (startTime < new Date()) {
      throw new Error("L'heure de début ne peut pas être dans le passé");
    }

    // Création formatée
    return await prisma.timeslot.create({
      data: {
        restaurant_id: restaurantId,
        date: slotDate,
        start_at: startTime,
        end_at: new Date(`${data.date}T${data.end_at}`),
        capacity: data.capacity,
        status: 'AVAILABLE'
      }
    });
  },

async getRestaurantTimeslots(restaurantId: number, filters?: { 
    date?: string; 
    status?: TimeslotStatus 
}) {
    console.log('[SERVICE] restaurantId reçu:', restaurantId); // Log de debug
    
    if (!restaurantId || isNaN(restaurantId)) {
        throw new Error("Invalid restaurant ID");
    }

    const whereClause: any = {
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
    }).then(timeslots => timeslots.map(formatTimeslot));
},

  async getTimeslotById(timeslotId: number, restaurantId?: number) {
    return await prisma.timeslot.findUnique({
      where: { 
        id: timeslotId,
        ...(restaurantId && { restaurant_id: restaurantId })
      }
    }).then(timeslot => timeslot ? formatTimeslot(timeslot) : null);
  },

  async updateTimeslot(timeslotId: number, data: Partial <{
    date?: string;
    start_at?: string;
    end_at?: string;
    capacity?: number;
    status?: TimeslotStatus;
  }>) {
    return await prisma.$transaction(async (prisma) => {
      // Get current timeslot data if needed for time updates
      const currentTimeslot = data.start_at || data.end_at 
        ? await prisma.timeslot.findUnique({ 
            where: { id: timeslotId } 
          })
        : null;

      if (!currentTimeslot && (data.start_at || data.end_at)) {
        throw new Error("Timeslot not found");
      }

      // Prepare update data
      const updateData: any = {};
      if (data.date) updateData.date = new Date(data.date);
      if (data.start_at) {
        const dateToUse = data.date || currentTimeslot!.date.toISOString().split('T')[0];
        updateData.start_at = new Date(`${dateToUse}T${data.start_at}`);
      }
      if (data.end_at) {
        const dateToUse = data.date || currentTimeslot!.date.toISOString().split('T')[0];
        updateData.end_at = new Date(`${dateToUse}T${data.end_at}`);
      }
      if (data.capacity) updateData.capacity = data.capacity;
      if (data.status) updateData.status = data.status;

      // Perform update
      return await prisma.timeslot.update({
        where: { id: timeslotId },
        data: updateData
      }).then(formatTimeslot);
    });
  },

  async deleteTimeslot(timeslotId: number) {
    return await prisma.timeslot.delete({
      where: { id: timeslotId }
    }).then(() => ({ message: "Timeslot deleted successfully" }));
  }
};