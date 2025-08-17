import { PrismaClient, UserType, user } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginDto, PublicUser, RegisterDto } from '../interface/dto/userDto';
import { randomBytes } from 'node:crypto';
import { generateResetToken, generateToken, hashPassword, verifyPassword } from '../utils/authUtils';

const prisma = new PrismaClient();

export const AuthService = {
   
async registerUser(dto: RegisterDto) {
  return prisma.user.create({
    data: {
      email: dto.email,
      password_hash: await bcrypt.hash(dto.password, 12),
      first_name: dto.name,
      last_name: dto.isRestaurateur ? null : dto.lastName,
      type_user: dto.type_user 
    }
  });
},


async loginUser(loginData: LoginDto): Promise<{ user: PublicUser; token: string }> {
  const user = await prisma.user.findUnique({
    where: { email: loginData.email },
    select: {
      id: true,
      email: true,
      type_user: true,
      password_hash: true
    }
  });

  if (!user) throw new Error('Utilisateur non trouvé');

  const passwordValid = await verifyPassword(loginData.password, user.password_hash);
  if (!passwordValid) throw new Error('Mot de passe incorrect');

  const token = generateToken(user.id, user.type_user);

  // Retourne uniquement les données publiques nécessaires
  return {
    user: {
      id: user.id,
      email: user.email,
      type: user.type_user,
    },
    token
  };
},

 async generateToken(user: { id: number; type_user: UserType }) {
  return jwt.sign(
    { id: user.id, type_user: user.type_user }, 
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' }
  );
},

  async forgotPassword(email: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Email non trouvé");

    // Utilisez directement generateResetToken depuis authUtils
    const resetToken = generateResetToken(user.id);

    // Stockez le token brut (car JWT gère déjà l'expiration)
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken }
    });

    return resetToken; // Envoyez ce token par email
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // 1. Vérifiez le token via jwt.verify() (déjà expiré si nécessaire)
    // (À implémenter si absent de authUtils)
    
    // 2. Trouvez l'utilisateur
    const user = await prisma.user.findFirst({
      where: { resetToken: token }
    });
    if (!user) throw new Error('Token invalide');

    // 3. Mettez à jour le mot de passe
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: await hashPassword(newPassword),
        resetToken: null // Invalidez le token après usage
      }
    });
  }
}