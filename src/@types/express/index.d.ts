// src/types/express.d.ts
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