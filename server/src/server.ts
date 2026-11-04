import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { redisClient } from './config/redis.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { API_PREFIXES, MESSAGES } from './constants/index.js';

const app = express();

// Connect to Database & Redis
connectDB();
redisClient.connect();

// Middlewares
app.use(async (_req, _res, next) => {
  await connectDB();
  next();
});
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use(API_PREFIXES.AUTH, authRoutes);
app.use(API_PREFIXES.ARTICLES, articleRoutes);
app.use(API_PREFIXES.USERS, userRoutes);

// Health check route
app.get(API_PREFIXES.HEALTH, (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: MESSAGES.COMMON.ROUTE_NOT_FOUND });
});

// Centralized Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Chronicle Server] Running on http://localhost:${PORT}`);
});

export default app;
