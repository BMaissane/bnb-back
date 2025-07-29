import { PrismaClient, ReservationStatus } from '@prisma/client';
import { CreateReservationInput, UpdateReservationInput } from '../interface/dto/reservationDto';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '../middleware/errors';
import { ReservationDetails } from '../interface/request/reservation.interface';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

const mapToDetails = (reservation: {
  id: number;
  status: ReservationStatus;
  special_requests?: string | null;
  timeslot: {
    start_at: Date;
    end_at: Date;
  };
  reservation_has_item?: {
    item_id: number;
    quantity: number;
    item_price: Decimal;
    item: {
      name: string;
    };
  }[];
}): ReservationDetails => {
  return {
    id: reservation.id,
    status: reservation.status,
    specialRequests: reservation.special_requests || undefined,
    timeslot: {
      startAt: reservation.timeslot.start_at,
      endAt: reservation.timeslot.end_at
    },
    items: reservation.reservation_has_item?.map(item => ({
      itemId: item.item_id,
      name: item.item.name,
      quantity: item.quantity,
      price: Number(item.item_price) // Conversion cruciale ici
    }))
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

// Exemple dans getById
async getById(id: number): Promise<ReservationDetails> {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      timeslot: {
        select: {
          start_at: true,
          end_at: true
        }
      },
      reservation_has_item: {
        select: {
          item_id: true,
          quantity: true,
          item_price: true,
          item: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });

  if (!reservation) throw new NotFoundError('Réservation non trouvée');
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

  async getAllRestaurantReservations(restaurantId: number): Promise<ReservationDetails[]> {
  return await prisma.$transaction(async (tx) => {
    const reservations = await tx.reservation.findMany({
      where: { restaurant_id: restaurantId },
      include: {
        timeslot: {
          select: {
            start_at: true,
            end_at: true
          }
        },
        reservation_has_item: {
          select: {
            item_id: true,
            quantity: true,
            item_price: true,
            item: {
              select: {
                name: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            first_name: true,
            email: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
    });

    return reservations.map(reservation => ({
      id: reservation.id,
      status: reservation.status,
      specialRequests: reservation.special_requests || undefined,
      timeslot: {
        startAt: reservation.timeslot.start_at,
        endAt: reservation.timeslot.end_at
      },
      items: reservation.reservation_has_item.map(item => ({
        itemId: item.item_id,
        name: item.item.name,
        quantity: item.quantity,
        price: Number(item.item_price)
      })),
      user: {
        id: reservation.user.id,
        firstName: reservation.user.first_name,
        email: reservation.user.email
      }
    }));
  });
},

async update(
  id: number, 
  data: { 
    specialRequests?: string; 
    status?: ReservationStatus 
  }
): Promise<ReservationDetails> {
  return await prisma.$transaction(async (tx) => {
    // 1. Vérifie que la réservation existe
    const existing = await tx.reservation.findUnique({
      where: { id },
      include: {
        timeslot: {
          select: {
            start_at: true,
            end_at: true
          }
        }
      }
    });

    if (!existing) {
      throw new NotFoundError('Réservation non trouvée');
    }

    // 2. Met à jour la réservation avec TOUS les champs requis
    const updated = await tx.reservation.update({
      where: { id },
      data: {
        special_requests: data.specialRequests,
        status: data.status
      },
      include: {
        timeslot: {
          select: {
            start_at: true,
            end_at: true
          }
        },
        reservation_has_item: {
          include: {
            item: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // 3. Retourne les données formatées
    return {
      id: updated.id,
      status: updated.status,
      specialRequests: updated.special_requests || undefined,
      timeslot: {
        startAt: updated.timeslot.start_at,
        endAt: updated.timeslot.end_at
      },
      items: updated.reservation_has_item?.map(item => ({
        itemId: item.item_id,
        name: item.item.name,
        quantity: item.quantity,
        price: Number(item.item_price)
      }))
    };
  });
},

async cancel(id: number, reason?: string): Promise<ReservationDetails> {
  return await prisma.$transaction(async (tx) => {
    // 1. Récupération complète avec les items
    const reservation = await tx.reservation.findUnique({
      where: { id },
      include: {
        timeslot: {
          select: {
            start_at: true,
            end_at: true
          }
        },
        reservation_has_item: {
          include: {
            item: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!reservation) throw new NotFoundError('Réservation non trouvée');

    // 2. Vérification du délai d'annulation
    const deadline = new Date(reservation.timeslot.start_at.getTime() - 24 * 3600 * 1000);
    if (new Date() > deadline) {
      throw new BusinessRuleError('Annulation impossible <24h avant');
    }

    // 3. Mise à jour et recréation du stock
    const [updated] = await Promise.all([
      tx.reservation.update({
        where: { id },
        data: {
          status: 'CANCELED',
          special_requests: reason ? `[ANNULÉ] ${reason}` : undefined
        },
        include: {
          timeslot: {
            select: {
              start_at: true,
              end_at: true
            }
          },
          reservation_has_item: {
            include: {
              item: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }),
      
      // Recréation du stock pour chaque item
      ...reservation.reservation_has_item.map(item =>
        tx.restaurant_has_item.updateMany({
          where: {
            item_id: item.item_id,
            restaurant_id: reservation.restaurant_id
          },
          data: {
            stock: { increment: item.quantity }
          }
        })
      ),
      
      // Libération du timeslot
      tx.timeslot.update({
        where: { id: reservation.timeslot_id },
        data: { status: 'AVAILABLE' }
      })
    ]);

    return mapToDetails(updated);
  });
}
};