import express from 'express';
import { prisma } from './prisma/client';
import helmet from 'helmet';
import 'reflect-metadata';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import userRouter from './routes/user';
import reservationsRouter from './routes/reservation';
import testRoutes from './routes/testRoutes';

const app = express();
const port = process.env.PORT || 3000;

// 1. Middlewares de sécurité FIRST
app.use(helmet());
app.use(corsMiddleware);

// 2. Body parsing (un seul parseur JSON)
app.use(express.json()); // <-- Supprimez jsonParser et urlencodedParser
app.use(express.urlencoded({ extended: true }));

// 3. Logging des requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Body:', req.body); // <-- Ajout crucial pour debug
  next();
});

// 4. Gestion des connexions Prisma
app.use((req, res, next) => {
  res.on('finish', () => {
    prisma.$disconnect().catch(console.error);
  });
  next();
});

// 5. Routes avec préfixe /api
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter); // <-- Changé de /users à /api/users
app.use('/api/reservations', reservationsRouter);
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