import { Types } from 'mongoose';
import { RegisterDTO, IUserDocument } from '../../types/index.js';

export interface SanitizedUser {
  _id?: Types.ObjectId;
  id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: Date;
  isVerified?: boolean;
  preferences: string[];
}

export interface AuthResult {
  token: string;
  user: SanitizedUser;
}

export interface RegisterResult {
  message: string;
  email: string;
  requiresOtp: boolean;
  devOtp?: string;
}

export interface IAuthService {
  register(data: RegisterDTO): Promise<RegisterResult>;
  verifyOtp(email: string, otp: string): Promise<AuthResult>;
  resendOtp(email: string): Promise<{ message: string; devOtp?: string }>;
  login(identifier?: string, password?: string): Promise<AuthResult>;
  getProfile(userId: string | Types.ObjectId): Promise<IUserDocument>;
}
