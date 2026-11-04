import { Model, UpdateQuery, Types } from 'mongoose';
import { IBaseRepository } from '../interfaces/repositories/IBaseRepository.js';

export class BaseRepository<T> implements IBaseRepository<T> {
  constructor(protected model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return await this.model.findById(id);
  }

  async findAll(): Promise<T[]> {
    return await this.model.find();
  }

  async updateById(
    id: string | Types.ObjectId,
    data: UpdateQuery<T>
  ): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id: string | Types.ObjectId): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async save(doc: any): Promise<T> {
    return await doc.save();
  }
}
