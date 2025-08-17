import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodEffects, ZodError } from 'zod';

export const validate = (schema: AnyZodObject | ZodEffects<AnyZodObject>) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Erreur de validation",
        details: err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        })),
        type: 'VALIDATION_ERROR'
      });    
}}};