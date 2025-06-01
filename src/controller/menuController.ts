import { Request, Response } from 'express';
import { MenuService } from '../service/menuService';
import { CreateMenuSchema } from '../interface/dto/menuDto';
import { z } from 'zod';
import { HttpException } from '../exception/httpException';

export class MenuController {
  static async createMenu(req: Request, res: Response) {
    try {
      const validatedData = CreateMenuSchema.parse(req.body);
      const menu = await MenuService.createMenu(validatedData);
      res.status(201).json(menu);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      if (error instanceof HttpException) {
        return res.status(error.status).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMenu(req: Request, res: Response) {
    try {
      const menu = await MenuService.getMenuWithItems(Number(req.params.id));
      res.json(menu);
    } catch (error) {
      // Gestion d'erreurs similaire
    }
  }
}