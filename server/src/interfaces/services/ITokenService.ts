import { CookieOptions } from 'express';
import { Types } from 'mongoose';

export interface TokenPayload {
  id: string;
  [key: string]: unknown;
}

export interface ITokenService {
  generateToken(userId: Types.ObjectId | string): string;
  verifyToken<T extends TokenPayload = TokenPayload>(token: string): T;

  generateRefreshToken(userId: Types.ObjectId | string): string;
  verifyRefreshToken<T extends TokenPayload = TokenPayload>(token: string): T;

  /** Cookie options for the access token (15 min) */
  getCookieOptions(): CookieOptions;
  /** Cookie options for the refresh token (7 days) */
  getRefreshCookieOptions(): CookieOptions;
}
