// src/dto/restaurant.dto.ts
import { z } from 'zod';

// 1. Schéma de validation pour les horaires
const timeSlotSchema = z.object({
  open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
}).refine(data => data.open < data.close, {
  message: "L'heure de fermeture doit être après l'ouverture"
});

const openingHoursSchema = z.record(
  z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  z.array(timeSlotSchema).optional()
);

// 2. Schémas Zod pour les DTOs
export const CreateRestaurantSchema = z.object({
  owner_id: z.number().int().positive(),
  name: z.string().min(2).max(100),
  address: z.string().max(255).optional(),
  opening_hours: openingHoursSchema.optional(),
  genre: z.string().max(50).optional(),
  siret: z.string().length(14).regex(/^\d+$/),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional()
});

export const UpdateRestaurantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  address: z.string().max(255).optional(),
  opening_hours: openingHoursSchema.optional(),
  genre: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional(),
  is_active: z.boolean().optional()
});

// 3. Types TypeScript (compatibles avec vos interfaces existantes)
export type CreateRestaurantDto = z.infer<typeof CreateRestaurantSchema>;
export type UpdateRestaurantDto = z.infer<typeof UpdateRestaurantSchema>;

// 4. Fonctions de validation
export const validateCreateRestaurant = (data: unknown) => 
  CreateRestaurantSchema.parse(data);

export const validateUpdateRestaurant = (data: unknown) =>
  UpdateRestaurantSchema.parse(data);