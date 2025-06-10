import { Request, Response } from 'express';
import { CreateUserDto, DeleteUserDto, UpdateUserDto } from '../interface/dto/userDto';
import { UserService } from '../service/UserService';
import { verifyPassword } from '../utils/authUtils';
import user from '../routes/user';
import prisma from '../prisma/client';

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData: CreateUserDto = req.body;
    const user = await UserService.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'error.message' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  console.log("🔍 Recherche user ID:", userId);

  try {
    // Test DIRECT sans middleware
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { restaurant: true } // Charge la relation pour debug
    });
    console.log("📦 Résultat Prisma:", user);

    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      return res.status(404).json({ error: "User not found (debug)" });
    }

    res.json(user);
  } catch (error) {
    console.error("💥 Erreur:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// export const getUserById = async (req: Request, res: Response) => {
//   try {
//     const userId = parseInt(req.params.id);
    
//     if (isNaN(userId)) {
//       return res.status(400).json({ error: "ID invalide" });
//     }

//     console.log("Recherche de l'utilisateur ID:", userId);
//     const user = await UserService.getUserById(userId);
    
//     if (!user) {
//       console.log("Utilisateur non trouvé pour ID:", userId);
//       return res.status(404).json({ error: "Utilisateur non trouvé" });
//     }

//     console.log("Utilisateur trouvé:", user);
//     res.json(user);
//   } catch (error) {
//     console.error("Erreur:", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };



export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const updateData: UpdateUserDto = req.body;

    // 1. Vérification que l'utilisateur existe
    const existingUser = await UserService.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Autorisation : seul l'utilisateur peut modifier son profil
    if (req.user?.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized - You can only update your own profile' });
    }

    // 3. Mise à jour effective
    const updatedUser = await UserService.updateUser(userId, updateData);
    res.json(updatedUser);

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Server error during update' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { password }: DeleteUserDto = req.body;

    // Vérifier que l'utilisateur est bien propriétaire du compte
    if (req.user?.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Récupérer l'utilisateur pour vérifier le mot de passe
    const user = await UserService.getUserByIdWithPassword(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Supprimer l'utilisateur
    await UserService.deleteUser(userId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

