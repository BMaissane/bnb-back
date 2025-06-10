import express from 'express';
import { prisma } from './prisma/client'; 
import reservationsRouter from './routes/reservation';
import helmet from 'helmet';
import 'reflect-metadata';
import { jsonParser, urlencodedParser } from './middleware/bodyParser';
import { corsMiddleware } from './middleware/cors';
import { authenticate, authorize } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth'; 
import testRoutes from './routes/testRoutes';
import userRouter from './routes/user'

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

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

app.use(express.json());
app.use(helmet());
app.use('/api/reservations', reservationsRouter);
app.use('/api/auth', authRouter); 
app.use('/users', userRouter);
app.use('/api/test', testRoutes);

app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('Hello World!');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});});

export default app;