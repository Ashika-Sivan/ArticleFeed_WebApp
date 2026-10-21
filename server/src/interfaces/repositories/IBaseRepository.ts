import { Types } from 'mongoose';

export interface IReadRepository<T, TOptions = unknown> {
  findById(id: string | Types.ObjectId, options?: TOptions): Promise<T | null>;
}

export interface IWriteRepository<T, TCreate = Partial<T>> {
  create(data: TCreate): Promise<T>;
  deleteById(id: string | Types.ObjectId): Promise<T | null>;
  save(doc: T): Promise<T>;
}

export interface IBaseRepository<T, TCreate = Partial<T>, TOptions = unknown>
  extends IReadRepository<T, TOptions>,
    IWriteRepository<T, TCreate> {}
