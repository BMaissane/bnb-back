import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { z } from 'zod'; // Pour la validation

// Schéma de validation avec Zod
const restaurantSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  siret: z.string().length(14, "Le SIRET doit contenir 14 chiffres"),
  address: z.string().min(5, "L'adresse est trop courte"),
  ownerId: z.number().int("L'ID du propriétaire doit être un nombre entier")
});

export const createRestaurant = async (req: Request, res: Response) => {
  try {
    // 1. Validation des données
    const validatedData = restaurantSchema.parse(req.body);

    // 2. Vérification que l'owner existe et est bien un "owner"
    const owner = await prisma.user.findUnique({
      where: { id: validatedData.ownerId, type_user: 'RESTAURANT_OWNER' }
    });

    if (!owner) {
      return res.status(400).json({ 
        error: "Owner invalide : l'utilisateur n'existe pas ou n'a pas les droits" 
      });
    }

    // 3. Création du restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        name: validatedData.name,
        siret: validatedData.siret,
        address: validatedData.address,
        owner: { connect: { id: validatedData.ownerId } }
      }
    });

    res.status(201).json(restaurant);

  } catch (error) {
    if (error instanceof z.ZodError) {
      // Erreur de validation Zod
      return res.status(400).json({ errors: error.flatten() });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
};