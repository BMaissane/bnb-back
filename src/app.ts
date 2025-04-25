import express from 'express';
import { prisma } from './prisma/client'; 
import reservationsRouter from './routes/reservation';
import helmet from 'helmet';
import 'reflect-metadata';
import { jsonParser, urlencodedParser } from './middleware/bodyParser';
import { corsMiddleware } from './middleware/cors';
import { authenticate, authorize } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = 3000;

// Middleware Prisma 
app.use((req, res, next) => {
  res.on('finish', () => {
    prisma.$disconnect().catch(console.error); 
  });
  next();
});

// Utilisation des middlewares
app.use(corsMiddleware);
app.use(jsonParser);
app.use(urlencodedParser);

// Routes
app.use(express.json());
app.use(helmet());
app.use('/api/reservations', reservationsRouter);

app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;