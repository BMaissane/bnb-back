import { UserType, Restaurant } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        type_user: UserType;
      };
    }
  }

  // Extension des types Prisma
  namespace Prisma {
    interface JsonObject {
      opening_hours?: Record<
        'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
        { open: string; close: string }[]
      >;
    }
  }
}

// Optionnel : Type utilitaire pour les réponses API
export type RestaurantResponse = Omit<Restaurant, 'opening_hours'> & {
  opening_hours?: globalThis.Prisma.JsonObject['opening_hours'];
};