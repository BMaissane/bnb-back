import { UserType } from '@prisma/client';
import { z } from 'zod';

// Schéma de validation avec Zod
// interfaces/dto/user.dto.ts
export const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phoneNumber: z.string().regex(/^\+?[\d\s]+$/).optional().nullable(),
    type: z.nativeEnum(UserType).default('CLIENT')
  });

export const UpdateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phoneNumber: z.string().regex(/^\+?[0-9\s]+$/).optional()
});

// Types TypeScript dérivés
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

// Type pour la réponse publique (sans données sensibles)
export interface PublicUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  type: UserType;
}