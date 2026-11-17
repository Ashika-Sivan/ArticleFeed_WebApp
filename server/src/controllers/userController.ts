import { Response } from 'express';
import { IUserService } from '../interfaces/index.js';
import { AuthRequest } from '../types/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import { MESSAGES, HttpStatus } from '../constants/index.js';

export class UserController {
  constructor(private readonly userServ: IUserService) {}

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: MESSAGES.AUTH.UNAUTHENTICATED });
      return;
    }
    const user = await this.userServ.updateProfile(req.user._id, req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.USER.PROFILE_UPDATED,
      user,
    });
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: MESSAGES.AUTH.UNAUTHENTICATED });
      return;
    }
    const result = await this.userServ.changePassword(req.user._id, req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      ...result,
    });
  });

  updatePreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: MESSAGES.AUTH.UNAUTHENTICATED });
      return;
    }
    const { preferences } = req.body;
    const user = await this.userServ.updatePreferences(req.user._id, preferences);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.USER.PREFERENCES_UPDATED,
      user,
    });
  });
}
