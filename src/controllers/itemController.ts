import { Request, Response } from 'express';
import itemService from '../services/itemService';

export const ItemController = {
  async createItem(req: Request, res: Response) {
    try {
      const { 
        name, 
        description, 
        category, 
        basePrice, 
        restaurantId, 
        initialStock } = req.body;

      // Validation des données (exemple simplifié)
      if (!name || !restaurantId) {
        return res.status(400).json({ error: "Name and restaurantId are required" });
      }

      const item = await itemService.createItemWithRestaurantLink(
        name,
        description,
        category,
        basePrice,
        restaurantId,
        initialStock
      );

      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
