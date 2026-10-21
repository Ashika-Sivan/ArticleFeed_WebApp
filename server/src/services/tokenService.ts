import { CookieOptions } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { ITokenService, TokenPayload } from '../interfaces/index.js';

export class TokenService implements ITokenService {
  private readonly secret: string;
  private readonly expiresIn: SignOptions['expiresIn'];
  private readonly isProduction: boolean;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'super_secret_jwt_key_article_feeds_app_2026';
    this.expiresIn = '7d';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  generateToken(userId: Types.ObjectId | string): string {
    const options: SignOptions = { expiresIn: this.expiresIn };
    return jwt.sign({ id: userId.toString() }, this.secret, options);
  }

  verifyToken<T extends TokenPayload = TokenPayload>(token: string): T {
    return jwt.verify(token, this.secret) as T;
  }

  getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  }
}

