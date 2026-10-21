import { Types, Model } from 'mongoose';
import User from '../models/User.js';
import { IUserDocument, IUser } from '../types/index.js';
import { IUserRepository } from '../interfaces/repositories/IUserRepository.js';
import { BaseRepository } from './baseRepository.js';

export class UserRepository
  extends BaseRepository<IUserDocument, Partial<IUser>>
  implements IUserRepository
{
  constructor(model: Model<IUserDocument> = User) {
    super(model);
  }

  async findById(
    id: string | Types.ObjectId,
    projection: string = '-password'
  ): Promise<IUserDocument | null> {
    return await this.model.findById(id).select(projection);
  }

  async findByIdWithPassword(id: string | Types.ObjectId): Promise<IUserDocument | null> {
    return await this.model.findById(id);
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return await this.model.findOne({ email: email.toLowerCase().trim() });
  }

  async findByPhone(phone: string): Promise<IUserDocument | null> {
    return await this.model.findOne({ phone: phone.trim() });
  }

  async findByEmailOrPhone(email: string, phone: string): Promise<IUserDocument | null> {
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const cleanPhone = phone ? phone.trim() : '';
    return await this.model.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
    });
  }

  async findByIdentifier(identifier: string): Promise<IUserDocument | null> {
    const clean = identifier.trim();
    return await this.model.findOne({
      $or: [{ email: clean.toLowerCase() }, { phone: clean }],
    });
  }

  async updateById(
    id: string | Types.ObjectId,
    updateData: Partial<IUser>
  ): Promise<IUserDocument | null> {
    return await this.model.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  }

  async addBlockedArticle(
    userId: string | Types.ObjectId,
    articleId: string | Types.ObjectId
  ): Promise<IUserDocument | null> {
    return await this.model.findByIdAndUpdate(userId, {
      $addToSet: { blockedArticles: articleId },
    });
  }

  async updatePreferences(
    userId: string | Types.ObjectId,
    preferences: string[]
  ): Promise<IUserDocument | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true, runValidators: true }
    ).select('-password');
  }

  async updateAuthenticationStatus(
    email: string,
    status: boolean
  ): Promise<IUserDocument | null> {
    return await this.model
      .findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { isVerified: status },
        { new: true }
      )
      .select('-password');
  }
}

