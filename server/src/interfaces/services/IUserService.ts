import { Types } from 'mongoose';
import { UpdateProfileDTO, ChangePasswordDTO, IUserDocument } from '../../types/index.js';
import { SanitizedUser } from './IAuthService.js';

export interface IUserService {
  updateProfile(userId: string | Types.ObjectId, data: UpdateProfileDTO): Promise<SanitizedUser>;
  changePassword(
    userId: string | Types.ObjectId,
    data: ChangePasswordDTO
  ): Promise<{ message: string }>;
  updatePreferences(
    userId: string | Types.ObjectId,
    preferences: string[]
  ): Promise<IUserDocument>;
}
