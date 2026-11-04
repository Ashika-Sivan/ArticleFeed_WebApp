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
  accessToken: string;
  refreshToken: string;
  user: SanitizedUser;
}

export interface RegisterResult {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: SanitizedUser;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthService {
  register(data: RegisterDTO): Promise<RegisterResult>;
  login(identifier?: string, password?: string): Promise<AuthResult>;
  refresh(refreshToken: string): Promise<RefreshResult>;
  getProfile(userId: string | Types.ObjectId): Promise<IUserDocument>;
}
