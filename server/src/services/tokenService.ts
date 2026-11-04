import { CookieOptions } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { ITokenService, TokenPayload } from '../interfaces/index.js';

export class TokenService implements ITokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly isProduction: boolean;

  constructor() {
    this.accessSecret =
      process.env.JWT_ACCESS_SECRET || 'access_secret_article_feeds_app_2026';
    this.refreshSecret =
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_article_feeds_app_2026';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // ─── Access Token (15 min) ───────────────────────────────────────────────────

  generateToken(userId: Types.ObjectId | string): string {
    const options: SignOptions = { expiresIn: '15m' };
    return jwt.sign({ id: userId.toString() }, this.accessSecret, options);
  }

  verifyToken<T extends TokenPayload = TokenPayload>(token: string): T {
    return jwt.verify(token, this.accessSecret) as T;
  }

  // ─── Refresh Token (7 days) ──────────────────────────────────────────────────

  generateRefreshToken(userId: Types.ObjectId | string): string {
    const options: SignOptions = { expiresIn: '7d' };
    return jwt.sign({ id: userId.toString() }, this.refreshSecret, options);
  }

  verifyRefreshToken<T extends TokenPayload = TokenPayload>(token: string): T {
    return jwt.verify(token, this.refreshSecret) as T;
  }

  // ─── Cookie Options ──────────────────────────────────────────────────────────

  /** httpOnly cookie for the short-lived access token (15 min) */
  getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    };
  }

  /** httpOnly cookie for the long-lived refresh token (7 days) */
  getRefreshCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  }
}
