import express from 'express';
import { prisma } from './prisma/client'; // Chevalier relatif correct
import reservationsRouter from './routes/reservations';

const app = express();
const port = 3000;

// Middleware pour fermer Prisma proprement
app.use((req, res, next) => {
  res.on('finish', () => {
    prisma.$disconnect().catch(console.error); // Déconnexion après chaque requête
  });
  next();
});

// Routes
app.use(express.json());
app.use('/reservations', reservationsRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;