import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const createRestaurant = async (req: Request, res: Response) => {
  const { name, ownerId } = req.body;

  try {
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        owner: { connect: { id: ownerId } }
      },
      include: { owner: true }
    });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création" });
  }
};

export const getRestaurants = async (req: Request, res: Response) => {
  const restaurants = await prisma.restaurant.findMany({
    include: { menu: true, timeslot: true }
  });
  res.json(restaurants);
};