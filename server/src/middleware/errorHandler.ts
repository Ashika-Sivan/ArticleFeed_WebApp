import { Request, Response, NextFunction } from 'express';
import { MESSAGES } from '../constants/index.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode || 500);

  // Friendly MongoDB duplicate key error handling
  if (err.code === 11000 && err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} ${MESSAGES.COMMON.ALREADY_EXISTS_SUFFIX}`,
    });
  }

  // Friendly Mongoose validation error handling
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. '),
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || MESSAGES.COMMON.SERVER_ERROR,
  });
};

export default errorHandler;
