import { Request } from 'express';
import { Types, Document } from 'mongoose';
import { CategoryType } from '../constants/categories.js';

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dob: Date;
  password?: string;
  preferences: CategoryType[];
  blockedArticles: Types.ObjectId[];
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends Document<Types.ObjectId>, Omit<IUser, '_id'> {
  _id: Types.ObjectId;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IArticle {
  _id: Types.ObjectId;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  category: CategoryType;
  author: Types.ObjectId | IUser;
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  blockedBy: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IArticleDocument extends Document<Types.ObjectId>, Omit<IArticle, '_id'> {
  _id: Types.ObjectId;
}

export interface AuthRequest extends Request {
  user?: IUserDocument | null;
}

export interface RegisterDTO {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dob: string | Date;
  password?: string;
  confirmPassword?: string;
  preferences?: CategoryType[];
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  dob?: string | Date;
}

export interface ChangePasswordDTO {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface CreateArticleDTO {
  title: string;
  description: string;
  images?: string[] | string;
  tags?: string[] | string;
  category: CategoryType;
}

export interface UpdateArticleDTO {
  title?: string;
  description?: string;
  images?: string[] | string;
  tags?: string[] | string;
  category?: CategoryType;
}

export interface FeedQueryParams {
  category?: string;
  search?: string;
  page?: string | number;
  limit?: string | number;
}

export interface MyArticlesQueryParams {
  search?: string;
  page?: string | number;
  limit?: string | number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  articles: T[];
  pagination: PaginationMeta;
}

