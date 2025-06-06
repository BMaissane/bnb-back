import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { UserType } from '@prisma/client';

interface TokenPayload {
  id: number;
  email: string;
  type_user: UserType; 
}

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name, isRestaurateur } = req.body;

    // Verification secret key JWT
   if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET invalide ou trop court');
}

    // 2. Vérification email existant optimisée
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Email déjà utilisé',
        code: 'EMAIL_EXISTS'
      });
    }

    // 3. Création utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: await bcrypt.hash(password, 12),
        first_name: name,
        last_name: "",
        type_user: isRestaurateur ? 'RESTAURANT_OWNER' : 'CLIENT'
      }
    });

    // 4. Génération token sécurisée
    const token = jwt.sign(
      { id: user.id, type_user: user.type_user },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      token,
      userId: user.id,
      userType: user.type_user
    });

  } catch (error) {
    console.error('Erreur registration:', error);
    return res.status(500).json({
      message: 'Erreur serveur',
      code: 'SERVER_ERROR'
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Debug: Afficher les valeurs reçues
    console.log('Tentative de login avec:', { email, password });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        id: true,
        email: true,
        password_hash: true,
        type_user: true 
      }
    });

    if (!user) {
      console.log('Utilisateur non trouvé pour email:', email);
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    // Debug: Comparaison mot de passe
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('Résultat comparaison mdp:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    // Vérification JWT_SECRET
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET manquant');
    }

    const token = jwt.sign(
      { id: user.id, type_user: user.type_user },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, userId: user.id });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};