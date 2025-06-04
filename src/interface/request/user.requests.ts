// src/interface/requests/user.request.ts
import { UserType } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        type_user: UserType;
      };
    }
  }
}

// Vos interfaces existantes...
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserType; 
}