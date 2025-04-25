import cors, { CorsOptions } from 'cors';
import { Request } from 'express';

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://studio.apollographql.com' // Pour GraphQL Playground
];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

export const corsMiddleware = cors(corsOptions);