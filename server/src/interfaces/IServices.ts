import { Types } from 'mongoose';
import {
  RegisterDTO,
  UpdateProfileDTO,
  ChangePasswordDTO,
  CreateArticleDTO,
  UpdateArticleDTO,
  FeedQueryParams,
  IArticleDocument,
  IUserDocument,
} from '../types/index.js';

export interface SanitizedUser {
  id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: Date;
  preferences: string[];
}

export interface AuthResult {
  token: string;
  user: SanitizedUser;
}

export interface ToggleReactionResult {
  likesCount: number;
  dislikesCount: number;
  isLiked: boolean;
  isDisliked: boolean;
}

export interface IAuthService {
  register(data: RegisterDTO): Promise<AuthResult>;
  login(identifier?: string, password?: string): Promise<AuthResult>;
  getProfile(userId: string | Types.ObjectId): Promise<IUserDocument>;
}

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

export interface IArticleService {
  getFeedArticles(
    userId: string | Types.ObjectId,
    query: FeedQueryParams
  ): Promise<{ articles: IArticleDocument[]; userPreferences: string[] }>;
  toggleLike(
    articleId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<ToggleReactionResult>;
  toggleDislike(
    articleId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<ToggleReactionResult>;
  blockArticle(
    articleId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<{ message: string }>;
  createArticle(
    userId: string | Types.ObjectId,
    data: CreateArticleDTO
  ): Promise<IArticleDocument>;
  getMyArticles(userId: string | Types.ObjectId): Promise<IArticleDocument[]>;
  getArticleById(articleId: string | Types.ObjectId): Promise<IArticleDocument>;
  updateArticle(
    articleId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    data: UpdateArticleDTO
  ): Promise<IArticleDocument>;
  deleteArticle(
    articleId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<{ message: string }>;
}
