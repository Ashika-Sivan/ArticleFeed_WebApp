import { Model, Document, Types } from 'mongoose';
import { IBaseRepository } from '../interfaces/repositories/IBaseRepository.js';

export abstract class BaseRepository<T extends Document, TCreate = Partial<T>, TOptions = unknown>
  implements IBaseRepository<T, TCreate, TOptions>
{
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string | Types.ObjectId, _options?: TOptions): Promise<T | null> {
    return await this.model.findById(id);
  }

  async create(data: TCreate): Promise<T> {
    return await this.model.create(data as unknown as Partial<T>);
  }

  async deleteById(id: string | Types.ObjectId): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async save(doc: T): Promise<T> {
    return await doc.save();
  }
}
