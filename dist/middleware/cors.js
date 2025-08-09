"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
const cors_1 = __importDefault(require("cors"));
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://studio.apollographql.com' // Pour GraphQL Playground
];
const corsOptions = {
    origin: '*', // (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    //   if (!origin || allowedOrigins.includes(origin)) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error('Not allowed by CORS'));
    //   }
    // },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
};
exports.corsMiddleware = (0, cors_1.default)(corsOptions);
