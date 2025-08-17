import { z } from 'zod';

// Schéma pour la création d'une réservation
export const createReservationSchema = z.object({
  userId: z.number().int().positive(),
  restaurantId: z.number().int().positive(),
  timeslotId: z.number().int().positive(),
  specialRequests: z.string().max(500).optional(),
  capacity: z.number().int().positive().min(1, "Au moins un place est requise"),
  items: z.array(
    z.object({
      itemId: z.number().int().positive(),
      quantity: z.number().int().positive().min(1).max(10),
    })
  ).min(1, "Au moins un item est requis"),
});

// Schéma pour la mise à jour d'une réservation
export const updateReservationSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELED']),
  specialRequests: z.string().max(500).optional(),
});

// Types dérivés des schémas
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;