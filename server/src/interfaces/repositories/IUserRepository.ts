import { Types } from 'mongoose';
import { IUserDocument, IUser } from '../../types/index.js';
import { IWriteRepository } from './IBaseRepository.js';

export interface IUserReader {
  findById(id: string | Types.ObjectId, projection?: string): Promise<IUserDocument | null>;
  findByIdWithPassword(id: string | Types.ObjectId): Promise<IUserDocument | null>;
  findByEmail(email: string): Promise<IUserDocument | null>;
  findByPhone(phone: string): Promise<IUserDocument | null>;
  findByEmailOrPhone(email: string, phone: string): Promise<IUserDocument | null>;
  findByIdentifier(identifier: string): Promise<IUserDocument | null>;
}

export interface IUserWriter extends IWriteRepository<IUserDocument, Partial<IUser>> {
  updateById(id: string | Types.ObjectId, updateData: Partial<IUser>): Promise<IUserDocument | null>;
  addBlockedArticle(
    userId: string | Types.ObjectId,
    articleId: string | Types.ObjectId
  ): Promise<IUserDocument | null>;
  updatePreferences(
    userId: string | Types.ObjectId,
    preferences: string[]
  ): Promise<IUserDocument | null>;
  updateAuthenticationStatus(
    email: string,
    status: boolean
  ): Promise<IUserDocument | null>;
}

export interface IUserRepository extends IUserReader, IUserWriter {}
