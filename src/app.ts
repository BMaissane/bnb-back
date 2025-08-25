import express from 'express';
import { prisma } from './prisma/client';
import helmet from 'helmet';
import 'reflect-metadata';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { urlencodedParser } from './middleware/bodyParser';
import authRouter from './routes/auth';
import userRouter from './routes/user';
import reservationsRouter from './routes/reservation';
import menuRouter from './routes/menu';
import itemRouter from './routes/item';
import timeslotRouter from './routes/timeslot';
import bodyParser from 'body-parser';
import testRoutes from './routes/testRoutes';
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
    prisma.$disconnect().catch(console.error);
  });
  next();
});

// 5. Routes 
const restaurantParentRouter = express.Router({ mergeParams: true });
app.use('/api/restaurants/:restaurantId', restaurantParentRouter); 
restaurantParentRouter.use('/timeslots', timeslotRouter);

app.use('/api/restaurants', restaurantRouter); 
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/menu', menuRouter);
app.use('/api/items', itemRouter);

app.use('/api/test', testRoutes);


// 6. Route racine
app.get('/', (req, res) => {
  res.send('API BookNBite');
});

// 7. Gestion des erreurs
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Template literal corrigé
});

export default app;