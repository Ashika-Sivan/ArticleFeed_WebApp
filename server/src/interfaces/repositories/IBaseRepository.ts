import { UpdateQuery, Types } from 'mongoose';

export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string | Types.ObjectId): Promise<T | null>;
  findAll(): Promise<T[]>;
  updateById(id: string | Types.ObjectId, data: UpdateQuery<T>): Promise<T | null>;
  deleteById(id: string | Types.ObjectId): Promise<T | null>;
  save(doc: any): Promise<T>;
}
