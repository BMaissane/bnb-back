import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { UserType} from '@prisma/client';
import { generateResetToken, generateToken, hashPassword } from '../utils/authUtils';
import { sendMockEmail } from '../utils/mockEmail'; 

interface TokenPayload {
  id: number;
  email: string;
  name: string;
  lastName?: string; 
  type_user: UserType; 
}

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name, lastName, isRestaurateur } = req.body;

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: await bcrypt.hash(password, 12),
        first_name: name,
        last_name: lastName || null,
        type_user: isRestaurateur ? 'RESTAURANT_OWNER' : 'CLIENT',
      },
      select: { 
        id: true,
        email: true,
        first_name: true,
        last_name: true // Inclure dans la réponse
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(400).json({ error: 'Échec de l\'inscription' });
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

// Fonction pour "mot de passe oublié"
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  // 1. Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ error: "Aucun utilisateur trouvé avec cet email" });
  }

  // 2. Générer un token temporaire (ex: valable 1h)
  const resetToken = generateResetToken(user.id); 
  
  // 3. Stocker le token en base (ou cache)
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken }
  });

  // 4. Envoyer un email (mock en développement)
  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
  sendMockEmail(email, `Lien de réinitialisation : ${resetLink}`);

  res.json({ message: "Lien de réinitialisation envoyé (vérifiez les logs)" });
};

// Fonction pour réinitialiser le mot de passe
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  // 1. Vérifier le token
  const user = await prisma.user.findFirst({ 
    where: { resetToken: token }
  });
  if (!user) {
    return res.status(400).json({ error: "Token invalide ou expiré" });
  }

  // 2. Mettre à jour le mot de passe
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      password_hash: await hashPassword(newPassword),
      resetToken: null // Invalider le token après usage
    }
  });

  res.json({ message: "Mot de passe réinitialisé avec succès" });
};