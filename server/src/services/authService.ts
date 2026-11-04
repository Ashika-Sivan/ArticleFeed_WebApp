import { Types } from 'mongoose';
import { RegisterDTO, IUserDocument } from '../types/index.js';
import {
  IUserRepository,
  ITokenService,
  IAuthService,
  AuthResult,
  RegisterResult,
  RefreshResult,
  SanitizedUser,
} from '../interfaces/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { MESSAGES } from '../constants/index.js';

export const sanitizeUser = (user: IUserDocument): SanitizedUser => ({
  _id: user._id,
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  dob: user.dob,
  isVerified: user.isVerified ?? true,
  preferences: user.preferences,
});

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenServ: ITokenService
  ) {}

  async register(data: RegisterDTO): Promise<RegisterResult> {
    const { firstName, lastName, phone, email, dob, password, confirmPassword, preferences } =
      data;

    if (!firstName || !lastName || !phone || !email || !dob || !password) {
      const error: AppError = new Error(MESSAGES.AUTH.REQUIRED_FIELDS);
      error.statusCode = 400;
      throw error;
    }

    if (password !== confirmPassword) {
      const error: AppError = new Error(MESSAGES.AUTH.PASSWORDS_DO_NOT_MATCH);
      error.statusCode = 400;
      throw error;
    }

    if (password.length < 6) {
      const error: AppError = new Error(MESSAGES.AUTH.PASSWORD_MIN_LENGTH);
      error.statusCode = 400;
      throw error;
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    const existing = await this.userRepo.findByEmailOrPhone(cleanEmail, cleanPhone);

    if (existing) {
      const message =
        existing.email === cleanEmail
          ? MESSAGES.AUTH.EMAIL_ALREADY_EXISTS
          : MESSAGES.AUTH.PHONE_ALREADY_EXISTS;
      const error: AppError = new Error(message);
      error.statusCode = 400;
      throw error;
    }

    const user = await this.userRepo.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      dob: new Date(dob),
      password,
      isVerified: true,
      preferences: Array.isArray(preferences) ? preferences : [],
    });

    const accessToken = this.tokenServ.generateToken(user._id);
    const refreshToken = this.tokenServ.generateRefreshToken(user._id);

    return {
      message: MESSAGES.AUTH.REGISTER_SUCCESS,
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    };
  }

  async login(identifier?: string, password?: string): Promise<AuthResult> {
    if (!identifier || !password) {
      const error: AppError = new Error(MESSAGES.AUTH.CREDENTIALS_REQUIRED);
      error.statusCode = 400;
      throw error;
    }

    const clean = identifier.trim();
    const user = await this.userRepo.findByIdentifier(clean);

    if (!user) {
      const error: AppError = new Error(MESSAGES.AUTH.INVALID_CREDENTIALS_NOT_FOUND);
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const error: AppError = new Error(MESSAGES.AUTH.INVALID_CREDENTIALS_PASSWORD);
      error.statusCode = 401;
      throw error;
    }

    const accessToken = this.tokenServ.generateToken(user._id);
    const refreshToken = this.tokenServ.generateRefreshToken(user._id);

    return { accessToken, refreshToken, user: sanitizeUser(user) };
  }

  async refresh(refreshToken: string): Promise<RefreshResult> {
    if (!refreshToken) {
      const error: AppError = new Error(MESSAGES.AUTH.INVALID_EXPIRED_TOKEN);
      error.statusCode = 401;
      throw error;
    }

    let decoded: { id: string };
    try {
      decoded = this.tokenServ.verifyRefreshToken<{ id: string }>(refreshToken);
    } catch {
      const error: AppError = new Error(MESSAGES.AUTH.INVALID_EXPIRED_TOKEN);
      error.statusCode = 401;
      throw error;
    }

    const user = await this.userRepo.findById(decoded.id);
    if (!user) {
      const error: AppError = new Error(MESSAGES.AUTH.TOKEN_USER_NOT_FOUND);
      error.statusCode = 401;
      throw error;
    }

    const newAccessToken = this.tokenServ.generateToken(user._id);
    const newRefreshToken = this.tokenServ.generateRefreshToken(user._id);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async getProfile(userId: string | Types.ObjectId): Promise<IUserDocument> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      const error: AppError = new Error(MESSAGES.USER.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}
