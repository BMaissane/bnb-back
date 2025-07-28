import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Enum pour les catégories
const CategoryEnum = z.enum(["STARTER", "MAIN", "DESSERT", "SIDE", "DRINK"]);

// Schéma de base pour un item
const MenuItemSchema = z.object({
  id: z.number().optional(), // Important pour l'update
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  category: CategoryEnum,
  price: z.number().min(0, "Le prix doit être positif"),
  stock: z.number().min(0).optional().default(0)
});

// Schéma pour la création
export const CreateMenuSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  items: z.array(MenuItemSchema.omit({ id: true })).optional() // On exclut id pour la création
});

// Schéma pour la mise à jour
export const UpdateMenuSchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  items: z.array(MenuItemSchema).optional() // On inclut id optionnel pour l'update
});

// Types TS correspondants
export type CreateMenuDto = z.infer<typeof CreateMenuSchema> & { restaurantId: number };
export type UpdateMenuDto = z.infer<typeof UpdateMenuSchema>;
export type MenuItemDto = z.infer<typeof MenuItemSchema>;