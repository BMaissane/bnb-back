import { UserType } from '@prisma/client';

// Déclaration globale Express (à garder UNIQUEMENT ici)
declare global {
  namespace Express {
  }
}

// Interfaces DTO
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  type_user?: UserType; 
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isRestaurateur: boolean;
}