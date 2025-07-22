import { PrismaClient } from '@prisma/client';
import { CreateReservationInput, UpdateReservationInput } from '../interface/dto/reservationDto';
import { ReservationDetails } from '../interface/request/reservation.interface';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '../middleware/errors';

const prisma = new PrismaClient();

const mapToDetails = (reservation: any): ReservationDetails => {
  return {
    id: reservation.id,
    userId: reservation.user_id,
    restaurantId: reservation.restaurant_id,
    timeslotId: reservation.timeslot_id,
    status: reservation.status,
    specialRequests: reservation.special_requests,
    createdAt: reservation.created_at,
    updatedAt: reservation.updated_at,
    user: {
      firstName: reservation.user.first_name,
      lastName: reservation.user.last_name,
      email: reservation.user.email,
    },
    restaurant: {
      name: reservation.restaurant.name,
      address: reservation.restaurant.address,
    },
    timeslot: {
      date: reservation.timeslot.date,
      startAt: reservation.timeslot.start_at,
      endAt: reservation.timeslot.end_at,
    },
    items: reservation.reservation_has_item.map((item: any) => ({
      itemId: item.item_id,
      name: item.item.name,
      quantity: item.quantity,
      itemPrice: item.item_price,
    })),
  };
};

export const ReservationService = {
  async create(data: CreateReservationInput): Promise<ReservationDetails> {
    return await prisma.$transaction(async (tx) => {
      // 1. Vérifier la disponibilité du timeslot
      const timeslot = await tx.timeslot.findUnique({
        where: { id: data.timeslotId },
      });

      if (!timeslot || timeslot.status !== 'AVAILABLE') {
        throw new BusinessRuleError("Ce créneau n'est plus disponible");
      }

      // 2. Vérifier les items
      const restaurantItems = await tx.restaurant_has_item.findMany({
        where: {
          restaurant_id: data.restaurantId,
          item_id: { in: data.items.map(i => i.itemId) },
        },
        include: { item: true },
      });

      for (const item of data.items) {
        const restaurantItem = restaurantItems.find(ri => ri.item_id === item.itemId);
        if (!restaurantItem?.is_available || restaurantItem.stock < item.quantity) {
          throw new BusinessRuleError(`L'item ${restaurantItem?.item.name} n'est pas disponible`);
        }
      }

      // 3. Créer la réservation
      const reservation = await tx.reservation.create({
        data: {
          user_id: data.userId,
          restaurant_id: data.restaurantId,
          timeslot_id: data.timeslotId,
          special_requests: data.specialRequests,
          reservation_has_item: {
            createMany: {
              data: data.items.map(item => ({
                item_id: item.itemId,
                quantity: item.quantity,
                item_price: restaurantItems.find(ri => ri.item_id === item.itemId)!.current_price,
              })),
            },
          },
        },
        include: {
          user: true,
          restaurant: true,
          timeslot: true,
          reservation_has_item: { include: { item: true } },
        },
      });

      // 4. Mettre à jour le timeslot
      await tx.timeslot.update({
        where: { id: data.timeslotId },
        data: { status: 'BOOKED' },
      });

      return mapToDetails(reservation);
    });
  },

  async getById(id: number, userId: number): Promise<ReservationDetails> {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        user: true,
        restaurant: true,
        timeslot: true,
        reservation_has_item: { include: { item: true } },
      },
    });

    if (!reservation) {
      throw new NotFoundError('Réservation non trouvée');
    }

    // Vérification des droits
    const isOwner = reservation.user_id === userId;
    const isRestaurantOwner = reservation.restaurant.owner_id === userId;

    if (!isOwner && !isRestaurantOwner) {
      throw new ForbiddenError('Vous n\'avez pas accès à cette réservation');
    }

    return mapToDetails(reservation);
  },

  async getByUserId(userId: number): Promise<ReservationDetails[]> {
    const reservations = await prisma.reservation.findMany({
      where: { user_id: userId },
      include: {
        user: true,
        restaurant: true,
        timeslot: true,
        reservation_has_item: { include: { item: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return reservations.map(mapToDetails);
  },

  async update(
    id: number,
    userId: number,
    data: UpdateReservationInput
  ): Promise<ReservationDetails> {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.reservation.findUnique({
        where: { id },
        include: { restaurant: true },
      });

      if (!existing) {
        throw new NotFoundError('Réservation non trouvée');
      }

      // Seul le client ou le propriétaire peut modifier
      const isOwner = existing.user_id === userId;
      const isRestaurantOwner = existing.restaurant.owner_id === userId;

      if (!isOwner && !isRestaurantOwner) {
        throw new ForbiddenError('Non autorisé à modifier cette réservation');
      }

      // Seul le client peut modifier les items/demandes spéciales
      if (data.specialRequests && !isOwner) {
        throw new ForbiddenError('Seul le client peut modifier les demandes spéciales');
      }

      const updated = await tx.reservation.update({
        where: { id },
        data: {
          status: data.status,
          special_requests: data.specialRequests,
        },
        include: {
          user: true,
          restaurant: true,
          timeslot: true,
          reservation_has_item: { include: { item: true } },
        },
      });

      return mapToDetails(updated);
    });
  },

  async cancel(id: number, userId: number, reason?: string): Promise<ReservationDetails> {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: { timeslot: true, restaurant: true },
      });

      if (!reservation) throw new NotFoundError('Réservation non trouvée');

      // Vérification des droits
      const canCancel = reservation.user_id === userId || 
                      reservation.restaurant.owner_id === userId;
      if (!canCancel) throw new ForbiddenError('Action non autorisée');

      // Vérification des 24h
      const isCancellable = new Date() < new Date(reservation.timeslot.start_at.getTime() - 24 * 3600 * 1000);
      if (!isCancellable) {
        throw new BusinessRuleError('Annulation impossible moins de 24h à l\'avance. Contactez le restaurant.');
      }

      // Mise à jour
      const updated = await tx.reservation.update({
        where: { id },
        data: {
          status: 'CANCELED',
          special_requests: reason ? `[ANNULÉ] ${reason}` : reservation.special_requests,
          timeslot: { update: { status: 'AVAILABLE' } }
        },
        include: {
          user: true,
          restaurant: true,
          timeslot: true,
          reservation_has_item: { include: { item: true } },
        },
      });

      return mapToDetails(updated);
    });
  }
};