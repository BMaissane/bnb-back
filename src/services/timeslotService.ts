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
async updateTimeslot(timeslotId: number, data: Partial<{
    date?: string;
    start_at?: string;
    end_at?: string;
    capacity?: number;
    status?: TimeslotStatus;
}>) {
    return await prisma.$transaction(async (prisma) => {
        // Vérification de l'existence du timeslot
        const current = await prisma.timeslot.findUnique({
            where: { id: timeslotId }
        });
        
        if (!current) {
            throw new Error("Timeslot not found");
        }

        // 1. Calcul de la nouvelle capacité
        const newCapacity = data.capacity ?? current.capacity;

        // 2. Règles métier pour le statut
        let newStatus: TimeslotStatus;
        
        if (data.status !== undefined) {
            // Cas 1 : Statut forcé manuellement
            newStatus = data.status; 
        } else if (newCapacity <= 0) {
            // Cas 2 : Capacité épuisée -> AUTO-BOOKED
            newStatus = 'BOOKED'; // Ou 'UNAVAILABLE' selon votre choix
        } else {
            // Cas 3 : Conserve le statut existant
            newStatus = current.status;
        }

        // 3. Préparation des données
        const updateData: any = {
            capacity: newCapacity,
            status: newStatus // Intègre toutes les règles ci-dessus
        };

        
        // Gestion des dates
        if (data.date) updateData.date = new Date(data.date);
        
        // Gestion des heures
        const dateToUse = data.date || current.date.toISOString().split('T')[0];
        if (data.start_at) updateData.start_at = new Date(`${dateToUse}T${data.start_at}`);
        if (data.end_at) updateData.end_at = new Date(`${dateToUse}T${data.end_at}`);

        // Mise à jour
        return await prisma.timeslot.update({
            where: { id: timeslotId },
            data: updateData
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