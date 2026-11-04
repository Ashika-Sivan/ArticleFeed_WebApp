import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { ITokenService, IUserRepository } from '../interfaces/index.js';
import { MESSAGES } from '../constants/index.js';

export class AuthMiddleware {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Protects routes by verifying the short-lived access token stored
   * in the `accessToken` httpOnly cookie.
   *
   * On expiry the client calls POST /api/auth/refresh (which uses the
   * refreshToken cookie) to get a new pair — then retries the request.
   */
  protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const token: string | undefined = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: MESSAGES.AUTH.NOT_AUTHORIZED_LOGIN,
      });
    }

    try {
      const decoded = this.tokenService.verifyToken<{ id: string }>(token);

      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: MESSAGES.AUTH.TOKEN_USER_NOT_FOUND,
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth verification error:', (error as Error).message);
      return res.status(401).json({
        success: false,
        message: MESSAGES.AUTH.INVALID_EXPIRED_TOKEN,
      });
    }
  };
}
