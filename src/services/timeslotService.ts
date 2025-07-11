import { PrismaClient, timeslot, TimeslotStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Helper pour le formatage des dates (exemple existant)
export const formatTimeslot = (timeslot: timeslot) => ({
  ...timeslot,
  date: timeslot.date.toISOString().split('T')[0],
  start_at: timeslot.start_at.toISOString().split('T')[1].slice(0, 5),
  end_at: timeslot.end_at.toISOString().split('T')[1].slice(0, 5)
});

// Helper interne pour la gestion des dates
function prepareDateTimeUpdates(
  data: Partial<{
    date?: string;
    start_at?: string;
    end_at?: string;
  }>, 
  current: timeslot
) {
  const updateData: {
    date?: Date;
    start_at?: Date;
    end_at?: Date;
  } = {};
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

export const TimeslotService = {

  // POST /timeslots
async createTimeslot(restaurantId: number, userId: number, data: {
  date: string | Date;
  start_at: string; // Format "HH:MM"
  end_at: string;   // Format "HH:MM"
  capacity: number;
}) {
  // Construction des dates complètes
  const dateStr = new Date(data.date).toISOString().split('T')[0]
  const startAt = new Date(`${dateStr}T${data.start_at}:00`)
  const endAt = new Date(`${dateStr}T${data.end_at}:00`)

  return await prisma.timeslot.create({
    data: {
      restaurant_id: restaurantId,
      date: new Date(dateStr),
      start_at: startAt,
      end_at: endAt,
      capacity: data.capacity,
      status: 'AVAILABLE'
    }
  })
},

// GET BY RESTAURANT_ID
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

// GET BY ID
  async getTimeslotById(timeslotId: number, restaurantId?: number) {
    return await prisma.timeslot.findUnique({
      where: { 
        id: timeslotId,
        ...(restaurantId && { restaurant_id: restaurantId })
      }
    }).then(timeslot => timeslot ? formatTimeslot(timeslot) : null);
  },

  // PATCH/UPDATE
  async updateTimeslot(
    timeslotId: number, 
    data: Partial<{
      date?: string;
      start_at?: string;
      end_at?: string;
      capacity?: number;
      status?: TimeslotStatus;
    }>
  ) {
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
        }).then(formatTimeslot);
      }

      // 2. Logique métier
      const newCapacity = data.capacity ?? current.capacity;
      let newStatus = data.status ?? current.status;
      
      if (newCapacity <= 0 && current.status !== 'UNAVAILABLE') {
        newStatus = 'BOOKED';
      } else if (newCapacity > 0 && current.status === 'BOOKED') {
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
      }).then(formatTimeslot);
    });
  },

  //DELETE
  async deleteTimeslot(timeslotId: number) {
    return await prisma.timeslot.delete({
      where: { id: timeslotId }
    }).then(() => ({ message: "Timeslot deleted successfully" }));
  }
};