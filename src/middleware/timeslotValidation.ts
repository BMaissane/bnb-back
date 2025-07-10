import { PrismaClient, TimeslotStatus } from '@prisma/client';
import { UserType } from '@prisma/client';
import { NextFunction } from 'express';


const prisma = new PrismaClient();

// Interface request timelsot
interface TimeslotRequestBody {
  date?: string | Date;
  start_at?: string;
  end_at?: string;
  capacity?: number;
  status?: TimeslotStatus;
  restaurant_id?: number;
  [key: string]: any;
}

// Middleware validation date
export const validateTimeslotDates = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const body = req.body as TimeslotRequestBody;
      
      if (body?.date) {
        // Conversion en Date si c'est une string
        const dateValue = typeof body.date === 'string' ? new Date(body.date) : body.date;
        
        if (dateValue < today) {
          body.status = TimeslotStatus.UNAVAILABLE;
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Appel Prisma client-extension query
const timeslotValidationExtension = prisma.$extends({
  name: 'timeslotValidation',
  query: {
    timeslot: {
      async create({ args, query }) {
        const now = new Date()
        
        // Validation des dates
        if (new Date(args.data.date) < now) {
          throw new Error('Cannot create timeslot with past date')
        }
        
        // Reconstruction des DateTime complets
        args.data.start_at = new Date(
          `${args.data.date.toString().split('T')[0]}T${args.data.start_at.toString().split('T')[1]}`
        )
        args.data.end_at = new Date(
          `${args.data.date.toString().split('T')[0]}T${args.data.end_at.toString().split('T')[1]}`
        )
        
        return query(args)
      }
    }
  }
});

// Exportez le client étendu au lieu du client de base
export const validatedPrisma = timeslotValidationExtension;