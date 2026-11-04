import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
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

// Connect to Database & Redis in persistent environments
if (!process.env.VERCEL) {
  connectDB();
  redisClient.connect();
}

// Middlewares
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[DB Middleware Error]:', err);
  }
  next();
});
app.use(
  cors({
    origin: true, // Dynamically allow calling origin with credentials
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
app.get(API_PREFIXES.HEALTH, async (_req: Request, res: Response) => {
  try {
    await connectDB();
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(200).json({
      status: 'ok',
      database: isDbConnected ? 'connected' : 'disconnected',
      hasMongoUri: !!process.env.MONGODB_URI,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: (err as Error).message,
      hasMongoUri: !!process.env.MONGODB_URI,
    });
  }
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: MESSAGES.COMMON.ROUTE_NOT_FOUND });
});

// Centralized Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Chronicle Server] Running on http://localhost:${PORT}`);
  });
}

export default app;
