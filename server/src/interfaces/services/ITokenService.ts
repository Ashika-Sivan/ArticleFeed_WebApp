import { CookieOptions } from 'express';
import { Types } from 'mongoose';

export interface TokenPayload {
  id: string;
  [key: string]: unknown;
}

export interface ITokenService {
  generateToken(userId: Types.ObjectId | string): string;
  verifyToken<T extends TokenPayload = TokenPayload>(token: string): T;
  getCookieOptions(): CookieOptions;
}
