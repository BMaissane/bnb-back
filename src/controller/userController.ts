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


// PATCH /api/users/:id
export const updateUser = async (req: Request, res: Response) => {
  try {
    console.log('Données reçues:', req.body); // Log du body entrant
    const userId = parseInt(req.params.id);
    const updateData = req.body;

    // Conversion camelCase → snake_case pour Prisma
    const prismaData = {
      phone_number: updateData.phoneNumber || updateData.phone_number,
      // Ajoutez d'autres champs si nécessaire
    };

    console.log('Données transformées pour Prisma:', prismaData); // Log des données transformées

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: prismaData,
      select: { id: true, email: true, phone_number: true }
    });

    console.log('Résultat de la mise à jour:', updatedUser); // Log du résultat
    res.json(updatedUser);
  } catch (error) {
    console.error('Erreur complète:', error);
    res.status(500).json({ error: 'Échec de la mise à jour' });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    console.log('Tentative de suppression user ID:', userId);

    // Vérification de l'existence de l'utilisateur
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Suppression effective
    await prisma.user.delete({ where: { id: userId } });
    console.log('Utilisateur supprimé avec succès');
    res.status(204).send();
  } catch (error) {
    console.error('Erreur de suppression:', error);
    res.status(500).json({ error: 'Échec de la suppression' });
  }
};

