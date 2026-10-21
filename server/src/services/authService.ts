import { Types } from 'mongoose';
import { RegisterDTO, IUserDocument } from '../types/index.js';
import {
  IUserRepository,
  ITokenService,
  IOtpService,
  IAuthService,
  AuthResult,
  RegisterResult,
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
  isVerified: user.isVerified,
  preferences: user.preferences,
});

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenServ: ITokenService,
    private readonly otpServ: IOtpService
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

    await this.userRepo.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      dob: new Date(dob),
      password,
      isVerified: false,
      preferences: Array.isArray(preferences) ? preferences : [],
    });

    // Store OTP in Redis/Memory and dispatch notification
    const otp = await this.otpServ.createOtp(cleanEmail);

    return {
      message: MESSAGES.OTP.SENT,
      email: cleanEmail,
      requiresOtp: true,
      devOtp: !process.env.EMAIL_USER ? otp : undefined,
    };
  }

  async verifyOtp(email: string, otp: string): Promise<AuthResult> {
    if (!email || !otp) {
      const error: AppError = new Error(MESSAGES.AUTH.REQUIRED_FIELDS);
      error.statusCode = 400;
      throw error;
    }

    const cleanEmail = email.toLowerCase().trim();
    await this.otpServ.verifyOtp(cleanEmail, otp);

    const updatedUser = await this.userRepo.updateAuthenticationStatus(cleanEmail, true);
    if (!updatedUser) {
      const error: AppError = new Error(MESSAGES.USER.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    const token = this.tokenServ.generateToken(updatedUser._id);
    return { token, user: sanitizeUser(updatedUser) };
  }

  async resendOtp(email: string): Promise<{ message: string; devOtp?: string }> {
    if (!email) {
      const error: AppError = new Error(MESSAGES.AUTH.REQUIRED_FIELDS);
      error.statusCode = 400;
      throw error;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await this.userRepo.findByEmail(cleanEmail);
    if (!user) {
      const error: AppError = new Error(MESSAGES.USER.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    if (user.isVerified) {
      const error: AppError = new Error('User is already verified. Please log in.');
      error.statusCode = 400;
      throw error;
    }

    const otp = await this.otpServ.createOtp(cleanEmail);
    return {
      message: MESSAGES.OTP.SENT,
      devOtp: !process.env.EMAIL_USER ? otp : undefined,
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

    if (user.isVerified === false) {
      await this.otpServ.createOtp(user.email);
      const error: AppError = new Error(MESSAGES.OTP.USER_NOT_VERIFIED);
      error.statusCode = 403;
      throw error;
    }

    const token = this.tokenServ.generateToken(user._id);
    return { token, user: sanitizeUser(user) };
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
