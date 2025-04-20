import express from 'express';
import { prisma } from './prisma/client'; 
import reservationsRouter from './routes/reservation';
import helmet from 'helmet';
import 'reflect-metadata';

const app = express();
const port = 3000;

// Middleware Prisma 
app.use((req, res, next) => {
  res.on('finish', () => {
    prisma.$disconnect().catch(console.error); 
  });
  next();
});

// Routes
app.use(express.json());
app.use(helmet());
app.use('/api/reservations', reservationsRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;