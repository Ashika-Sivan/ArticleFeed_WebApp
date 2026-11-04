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

  // Handle MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000 && err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    const fieldLabels: Record<string, string> = {
      email: 'Email address',
      phone: 'Phone number',
    };
    const label = fieldLabels[field] || field.charAt(0).toUpperCase() + field.slice(1);
    return res.status(400).json({
      success: false,
      message: `${label} is already registered. Please use another one or log in.`,
    });
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Please check the information you entered and try again.',
    });
  }

  // Handle Mongoose Invalid ID (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'The requested item could not be found.',
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || MESSAGES.COMMON.SERVER_ERROR,
  });
};

export default errorHandler;
