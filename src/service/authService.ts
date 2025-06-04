import { PrismaClient, UserType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class AuthService {
  static async registerUser(email: string, password: string, name: string, isRestaurateur: boolean) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const userType = isRestaurateur ? UserType.RESTAURANT_OWNER : UserType.CLIENT;

    return prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        first_name: name,
        last_name: "",
        type_user: userType
      }
    });
  }

  static async loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Utilisateur non trouvé');

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new Error('Mot de passe incorrect');

    return user;
  }

  static generateToken(user: { id: number; type_user: UserType }) {
    return jwt.sign(
      { id: user.id, type_user: user.type_user },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );
  }
}