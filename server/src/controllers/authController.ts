import { Request, Response } from 'express';
import { IAuthService, ITokenService } from '../interfaces/index.js';
import { AuthRequest } from '../types/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import { MESSAGES } from '../constants/index.js';

export class AuthController {
  constructor(
    private readonly authServ: IAuthService,
    private readonly tokenServ: ITokenService
  ) {}

  registerUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authServ.register(req.body);
    res.status(201).json({
      success: true,
      message: result.message,
      email: result.email,
      requiresOtp: result.requiresOtp,
      devOtp: result.devOtp,
    });
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const { token, user } = await this.authServ.verifyOtp(email, otp);
    res.cookie('token', token, this.tokenServ.getCookieOptions());

    res.status(200).json({
      success: true,
      message: MESSAGES.OTP.VERIFIED,
      user,
    });
  });

  resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await this.authServ.resendOtp(email);

    res.status(200).json({
      success: true,
      message: result.message,
      devOtp: result.devOtp,
    });
  });

  loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { identifier, password } = req.body;
    const { token, user } = await this.authServ.login(identifier, password);
    res.cookie('token', token, this.tokenServ.getCookieOptions());

    res.status(200).json({
      success: true,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      user,
    });
  });

  logoutUser = (_req: Request, res: Response): void => {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'lax',
    });

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
    res.status(200).json({
      success: true,
      user,
    });
  });
}
