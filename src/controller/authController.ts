import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { UserType } from '@prisma/client';

interface TokenPayload {
  id: number;
  email: string;
  type_user: 'CLIENT' | 'RESTAURANT_OWNER';
}

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name, isRestaurateur } = req.body;

    // Vérification pour savoir si l'utilisateur existe déja dans la BDD via son email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Hashing du mot de pass
    const hashedPassword = await bcrypt.hash(password, 12);

    // Logique métier différente celon type d'ulisateur
    const userType = isRestaurateur ? UserType.RESTAURANT_OWNER : UserType.CLIENT;

    // Structure différente selon le type d'utilisateur
    const userData = isRestaurateur
      ? {
          email,
          password_hash: hashedPassword,
          first_name: name, // Nom du restaurant = name//first_name
          last_name: "", // Vide pour les restaurants
          type_user: userType 
        }
      : {
          email,
          password_hash: hashedPassword,
          first_name: name.split(' ')[0], // Prénom
          last_name: name.split(' ').slice(1).join(' ') || "", // Nom de famille
          type_user: userType 
        };

    const user = await prisma.user.create({
      data: userData
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, type_user: user.type_user },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    res.status(201).json({ 
      token, 
      userId: user.id,
      userType: user.type_user 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création du compte' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, type_user: user.type_user } as TokenPayload,
      process.env.JWT_SECRET as string,
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    res.json({ token, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};