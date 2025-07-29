import { Request, Response, NextFunction } from 'express';
import { ItemCategory } from '../@types/express/itemCategory';
import { z } from 'zod';
import { ItemService } from '../services/itemService';

const createItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(), // Explicitement optionnel et nullable
  category: z.nativeEnum(ItemCategory),
  basePrice: z.number().positive(),
  restaurantId: z.number().int().positive(),
  initialStock: z.number().int().min(0).optional().default(0),
});

const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(ItemCategory).optional(),
  basePrice: z.number().positive().optional()
});

export const ItemController = {
  // POST api/items
   async createItem(req: Request, res: Response, next : NextFunction) {
    try {

      if (!req.user) throw new Error('Unauthorized');
      // Validation des données
      const validatedData = createItemSchema.parse(req.body);
      
const item = await ItemService.createItemWithRestaurantLink(
  {
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    basePrice: req.body.basePrice
  },
  req.body.restaurantId,
  {
    menuId: req.body.menuId, // Optionnel
    initialStock: req.body.initialStock // Optionnel
  }
);;      res.status(201).json(item);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  },

  // GET api/items/:id
  async getItemById(req: Request, res: Response, next : NextFunction) {
  try {
    const { id } = req.params;
    
    // Validation basique de l'ID
    if (isNaN(Number(id))) {
      return res.status(400).json({ error: "ID must be a number" });
    }

    const item = await ItemService.getItemById(Number(id));
    
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({
      ...item,
      // Formattage optionnel pour le frontend
      availability: item.restaurant_has_item.map(rhi => ({
        restaurantId: rhi.restaurant_id,
        price: rhi.current_price,
        stock: rhi.stock
      }))
    });
  } catch (error) {
    next(error);
  }
},

// PATCH/UPDATE api/items:id
async updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = Number(req.params.restaurantId);
    const itemId = Number(req.params.itemId); // Changé de params.id à params.itemId
    const { name, description, category, basePrice } = req.body;

    if (isNaN(restaurantId) || isNaN(itemId)) {
      return res.status(400).json({ error: "IDs invalides" });
    }
   const validatedData = updateItemSchema.parse(req.body);
    const updatedItem = await ItemService.updateItem(itemId, validatedData);

    res.json(updatedItem);
  } catch (error) {
    next(error);
  }
},

// DELETE api/items/:id
async deleteItem(req: Request, res: Response, next : NextFunction) {
  try {
    const itemId = Number(req.params.id);

    if (isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    await ItemService.deleteItem(itemId);
    res.status(204).send(); // No Content
  } catch (error) {
    next(error);
  }
}
}
