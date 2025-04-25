import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

interface HttpError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: HttpError | Prisma.PrismaClientKnownRequestError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  // Gestion des erreurs Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({
      error: 'Database error',
      code: err.code,
      meta: err.meta
    });
  }

  // Gestion des erreurs de validation Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({ error: message });
};