import { z } from 'zod';
import { ItemCategory } from '@prisma/client';

export const CreateMenuSchema = z.object({
  restaurantId: z.number().positive(),
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  items: z.array(
    z.object({
      name: z.string().min(2),
      description: z.string().optional(),
      category: z.nativeEnum(ItemCategory),
      price: z.number().positive(),
      stock: z.number().int().nonnegative().optional()
    })
  ).optional()
});

export type CreateMenuDto = z.infer<typeof CreateMenuSchema>;
export type UpdateMenuDto = Partial<CreateMenuDto>;