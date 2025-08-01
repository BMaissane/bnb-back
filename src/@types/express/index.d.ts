import { UserType, Restaurant } from '@prisma/client';

declare global {
  namespace Express {
      interface AuthenticatedUser {
      id: number;
      type_user: UserType;
    }
    interface Request {
      user?: AuthenticatedUser;
      restaurantId?: number;
    }
  }
  
   interface ParamsDictionary {
      restaurantId?: string;
      timeslotId?: string;
      itemId?: string;
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

export interface AuthenticatedRequest extends Express.Request {
  user: Express.AuthenticatedUser; // Version non-optionnelle
  restaurantId?: number;
}
export type { AuthenticatedUser } from Express;