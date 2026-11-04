import { Request, Response } from 'express';
import { IAuthService, ITokenService } from '../interfaces/index.js';
import { AuthRequest } from '../types/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import { MESSAGES } from '../constants/index.js';

const ACCESS_TOKEN_COOKIE = 'accessToken';
const REFRESH_TOKEN_COOKIE = 'refreshToken';

export class AuthController {
  constructor(
    private readonly authServ: IAuthService,
    private readonly tokenServ: ITokenService
  ) {}

  registerUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authServ.register(req.body);

    res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, this.tokenServ.getCookieOptions());
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, this.tokenServ.getRefreshCookieOptions());

    res.status(201).json({
      success: true,
      message: result.message,
      user: result.user,
    });
  });

  loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { identifier, password } = req.body;
    const result = await this.authServ.login(identifier, password);

    res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, this.tokenServ.getCookieOptions());
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, this.tokenServ.getRefreshCookieOptions());

    res.status(200).json({
      success: true,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      user: result.user,
    });
  });

  /**
   * POST /api/auth/refresh
   * Reads the refresh token from its httpOnly cookie, verifies it,
   * and issues a fresh access token + refresh token pair via cookies.
   */
  refreshTokens = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken: string | undefined = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      res.status(401).json({ success: false, message: MESSAGES.AUTH.INVALID_EXPIRED_TOKEN });
      return;
    }

    const result = await this.authServ.refresh(refreshToken);

    res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, this.tokenServ.getCookieOptions());
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, this.tokenServ.getRefreshCookieOptions());

    res.status(200).json({ success: true, accessToken: result.accessToken });
  });

  logoutUser = (_req: Request, res: Response): void => {
    // Clear both cookies
    res.cookie(ACCESS_TOKEN_COOKIE, '', { httpOnly: true, expires: new Date(0) });
    res.cookie(REFRESH_TOKEN_COOKIE, '', { httpOnly: true, expires: new Date(0) });

    res.status(200).json({
      success: true,
      message: MESSAGES.AUTH.LOGOUT_SUCCESS,
    });
  };

  getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: MESSAGES.AUTH.UNAUTHENTICATED });
      return;
    }
    const user = await this.authServ.getProfile(req.user._id);
    res.status(200).json({ success: true, user });
  });
}
