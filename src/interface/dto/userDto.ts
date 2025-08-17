import { UserType } from '@prisma/client';
import { z } from 'zod';

// Gestion des numéros de téléphone selon modèle français
export const phoneNumberSchema = z.string()
  .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, {
    message: "Numéro de téléphone français invalide"
  })
  .transform(val => val.replace(/[\s.-]/g, '')) // Normalise en supprimant espaces/points/tirets
  .optional()
  .nullable();

export const RegisterSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  name: z.string().min(2).regex(/^[^<>]*$/),
  lastName: z.string().min(2).regex(/^[^<>]*$/).optional().nullable(),
  isRestaurateur: z.boolean()
}).transform((data) => ({
  ...data,
  type_user: data.isRestaurateur ? UserType.RESTAURANT_OWNER : UserType.CLIENT
}));


export const LoginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères"),
}).strict();

export const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères"),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phoneNumber: phoneNumberSchema,
    type: z.nativeEnum(UserType).default('CLIENT')
  });
  

export const UpdateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phoneNumber: phoneNumberSchema,
}).strict(); // .strict() empêche les champs non déclarés

export const DeleteUserSchema = z.object({
  password: z.string().min(8) // Pour confirmation par mot de passe
});

export type DeleteUserDto = z.infer<typeof DeleteUserSchema>;
// Types TypeScript dérivés
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;


// Type pour la réponse publique (sans données sensibles)
export type  PublicUser = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  type: UserType;
}