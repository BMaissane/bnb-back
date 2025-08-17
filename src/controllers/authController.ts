import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { UserType} from '@prisma/client';

import { sendMockEmail } from '../utils/mockEmail'; 
import { generateResetToken, hashPassword } from '../utils/authUtils';
import { RegisterSchema } from '../interface/dto/userDto';
import { AuthService } from '../services/authService';

interface TokenPayload {
  id: number;
  email: string;
  name: string;
  lastName?: string; 
  type_user: UserType; 
}

export const AuthController = {

async registerUser(req: Request, res: Response, next: NextFunction) {
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
    next(error);
  }
},

async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await AuthService.loginUser(req.body);
      
      res.status(200).json({
        user,
        token
      });
    } catch (error) {
      next(error);
    }
  },


// async loginUser(req: Request, res: Response, next : NextFunction){
//   try {
//     // Validation basique
//     if (!req.body?.email || !req.body?.password) {
//       return res.status(400).json({ 
//         code: 'MISSING_CREDENTIALS',
//         message: 'Email et mot de passe requis' 
//       });
//     }

//     const { email, password } = req.body;

//     // Debug: Afficher les valeurs reçues
//     console.log('Tentative de login avec:', { email, password });

//     const user = await prisma.user.findUnique({
//       where: { email },
//       select: { 
//         id: true,
//         email: true,
//         password_hash: true,
//         type_user: true 
//       }
//     });

//     if (!user) {
//       console.log('Utilisateur non trouvé pour email:', email);
//       return res.status(401).json({ message: 'Identifiants incorrects' });
//     }

//     // Debug: Comparaison mot de passe
//     const isMatch = await bcrypt.compare(password, user.password_hash);
//     console.log('Résultat comparaison mdp:', isMatch);

//     if (!isMatch) {
//       return res.status(401).json({ message: 'Identifiants incorrects' });
//     }

//     // Vérification JWT_SECRET
//     if (!process.env.JWT_SECRET) {
//       throw new Error('JWT_SECRET manquant');
//     }

//     const token = jwt.sign(
//       { id: user.id, type_user: user.type_user },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     res.json({ token, userId: user.id });

//   } catch (error) {
//    next(error);
//   }
// },


// Fonctions mot de passe oublié + nouveau mot de passe
async forgotPassword(req: Request, res: Response, next : NextFunction) {
  try {
    const token = await AuthService.forgotPassword(req.body.email);
    console.log(`Lien mock : /reset-password?token=${token}`); 
    res.json({ message: "Regardez les logs pour le lien" });
  } catch (error) {
    next(error);
  }
},

  async resetPassword(req: Request, res: Response, next : NextFunction) {
    try {
      const { token, newPassword } = req.body;
      await AuthService.resetPassword(token, newPassword);
      res.json({ message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
      next(error);
    }
  }
}
