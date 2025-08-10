import express from 'express';
import { prisma } from './prisma/client';
import helmet from 'helmet';
import 'reflect-metadata';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import userRouter from './routes/user';
import reservationsRouter from './routes/reservation';
import menuRouter from './routes/menu';
import itemRouter from './routes/item';
import timeslotRouter from './routes/timeslot';
import restaurantRouter from './routes/restaurant';


const app = express();
const port = process.env.PORT || 3600;
app.use(express.json());

// 1. Middlewares de sécurité
app.use(helmet());
app.use(corsMiddleware);

// 2. Body parsing
app.use(express.urlencoded({ extended: true }));

// 3. Logging des requêtes 
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  next();
});

// 4. Prisma middleware 
app.use((req, res, next) => {
  res.on('finish', () => {
    if (prisma && typeof prisma.$disconnect === 'function') {
      prisma.$disconnect().catch(() => {});
    }
  });
  next();
});

// Route test pour Jest
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// 5. Routes 
const restaurantParentRouter = express.Router({ mergeParams: true });
app.use('/api/restaurants/:restaurantId', restaurantParentRouter); // :restaurantId dynamique
restaurantParentRouter.use('/timeslots', timeslotRouter); // Route imbriquée

app.use('/api/restaurants', restaurantRouter); 
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/menu', menuRouter);
app.use('/api/items', itemRouter);


// 6. Route racine
app.get('/', (req, res) => {
  res.send('API BookNBite');
});

// 7. Gestion des erreurs
app.use(errorHandler);

export default app;
