import { Types } from 'mongoose';
import { UpdateProfileDTO, ChangePasswordDTO, IUserDocument } from '../types/index.js';
import { IUserRepository, IUserService, SanitizedUser } from '../interfaces/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { sanitizeUser } from './authService.js';
import { MESSAGES } from '../constants/index.js';

export class UserService implements IUserService {
  constructor(private readonly userRepo: IUserRepository) {}

  async updateProfile(
    userId: string | Types.ObjectId,
    data: UpdateProfileDTO
  ): Promise<SanitizedUser> {
    const { firstName, lastName, phone, email, dob } = data;

    const user = await this.userRepo.findById(userId);
    if (!user) {
      const error: AppError = new Error(MESSAGES.USER.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    // Check unique email/phone conflicts
    if (email && email.toLowerCase().trim() !== user.email) {
      const cleanEmail = email.toLowerCase().trim();
      const existingEmail = await this.userRepo.findByEmail(cleanEmail);
      if (existingEmail && existingEmail._id.toString() !== userId.toString()) {
        const error: AppError = new Error(MESSAGES.USER.EMAIL_TAKEN);
        error.statusCode = 400;
        throw error;
      }
      user.email = cleanEmail;
    }

    if (phone && phone.trim() !== user.phone) {
      const cleanPhone = phone.trim();
      const existingPhone = await this.userRepo.findByPhone(cleanPhone);
      if (existingPhone && existingPhone._id.toString() !== userId.toString()) {
        const error: AppError = new Error(MESSAGES.USER.PHONE_TAKEN);
        error.statusCode = 400;
        throw error;
      }
      user.phone = cleanPhone;
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (dob) user.dob = new Date(dob);

    await this.userRepo.save(user);

    return sanitizeUser(user);
  }

  async changePassword(
    userId: string | Types.ObjectId,
    { currentPassword, newPassword, confirmPassword }: ChangePasswordDTO
  ): Promise<{ message: string }> {
    if (!currentPassword || !newPassword || !confirmPassword) {
      const error: AppError = new Error(MESSAGES.USER.PASSWORD_FIELDS_REQUIRED);
      error.statusCode = 400;
      throw error;
    }

    if (newPassword !== confirmPassword) {
      const error: AppError = new Error(MESSAGES.USER.NEW_PASSWORDS_DO_NOT_MATCH);
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 6) {
      const error: AppError = new Error(MESSAGES.USER.NEW_PASSWORD_MIN_LENGTH);
      error.statusCode = 400;
      throw error;
    }

    const user = await this.userRepo.findByIdWithPassword(userId);
    if (!user) {
      const error: AppError = new Error(MESSAGES.USER.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      const error: AppError = new Error(MESSAGES.USER.CURRENT_PASSWORD_INCORRECT);
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;
    await this.userRepo.save(user);

    return { message: MESSAGES.USER.PASSWORD_CHANGED_SUCCESS };
  }

  async updatePreferences(
    userId: string | Types.ObjectId,
    preferences: string[]
  ): Promise<IUserDocument> {
    if (!Array.isArray(preferences)) {
      const error: AppError = new Error(MESSAGES.USER.PREFERENCES_MUST_BE_ARRAY);
      error.statusCode = 400;
      throw error;
    }

    const user = await this.userRepo.updatePreferences(userId, preferences);
    if (!user) {
      const error: AppError = new Error(MESSAGES.USER.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    return user;
  }
}
