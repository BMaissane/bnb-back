// user.service.ts
import { CreateUserDto } from '../interface/dto/userDto';
import { hashPassword } from '../utils/authUtils';
import { prisma } from '../prisma/client';
import UpdateUserSchema from '../dto/userDto'

export class UserService {
  static async createUser(dto: CreateUserDto) {
    const { password, ...rest } = dto;
    
    return prisma.user.create({
      data: {
        email: rest.email,
        password_hash: await hashPassword(password),
        first_name: rest.firstName,    // Conversion camelCase → snake_case
        last_name: rest.lastName,
        phone_number: rest.phoneNumber, // Champ optionnel
        type_user: rest.type
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        type_user: true
      }
    });
  }

static async getUserById(id: number) {
  return prisma.user.findUnique({ 
    where: { id },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      type_user: true,
    }
  });
}

  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password_hash: true, // Nécessaire pour l'authentification
        type_user: true
      }
    });
  }

  static async getUserByIdWithPassword(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      password_hash: true, // On a besoin du hash pour vérification
      // ... autres champs si nécessaire
    }
  });
}

static async updateUser(id: number, dto: UpdateUserSchema) {
  return prisma.user.update({
    where: { id },
    data: {
      first_name: dto.firstName, // Conversion camelCase -> snake_case
      last_name: dto.lastName,
      phone_number: dto.phoneNumber
    },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      type_user: true
    }
  });
}

static async deleteUser(id: number) {
  return prisma.user.delete({
    where: { id }
  });
}
}


