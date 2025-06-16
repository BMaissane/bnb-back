import express from 'express';
import { prisma } from './prisma/client';
import helmet from 'helmet';
import 'reflect-metadata';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import userRouter from './routes/user';
import reservationsRouter from './routes/reservation';
import restaurantRouter from './routes/restaurant';
import menuRouter from './routes/menu';
import testRoutes from './routes/testRoutes';
import { urlencodedParser } from './middleware/bodyParser';

const app = express();
const port = process.env.PORT || 3000;

// 3. Logging des requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Body:', req.body); // <-- Ajout crucial pour debug
  next();
});

// 1. Middlewares de sécurité 
app.use(helmet());
app.use(corsMiddleware);

// 2. Body parsing 
app.use(express.json()); 
app.use(urlencodedParser);

// 4. Prisma middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    prisma.$disconnect().catch(console.error);
  });
  next();
});

// 5. Routes 
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter); 
app.use('/api/reservations', reservationsRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/restaurants/:restaurantId/menus', menuRouter);
app.use('/api/test', testRoutes);

// 6. Route racine
app.get('/', (req, res) => {
  res.send('API BookiBlate');
});

// 7. Gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;