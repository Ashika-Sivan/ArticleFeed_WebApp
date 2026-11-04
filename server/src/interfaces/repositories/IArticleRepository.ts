import { Types, UpdateQuery } from 'mongoose';
import { IArticleDocument, IArticle } from '../../types/index.js';
import { IBaseRepository } from './IBaseRepository.js';

export interface FeedQueryOptions {
  blockedArticleIds?: (Types.ObjectId | string)[];
  category?: string;
  userPreferences?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuthorQueryOptions {
  authorId: Types.ObjectId | string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BlockedQueryOptions {
  articleIds: (Types.ObjectId | string)[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface RepositoryPaginationResult<T> {
  articles: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IArticleRepository extends IBaseRepository<IArticleDocument> {
  findFeedArticles(options: FeedQueryOptions): Promise<RepositoryPaginationResult<IArticleDocument>>;
  findBlockedArticles(
    options: BlockedQueryOptions
  ): Promise<RepositoryPaginationResult<IArticleDocument>>;
  findByAuthor(
    authorIdOrOptions: Types.ObjectId | string | AuthorQueryOptions
  ): Promise<RepositoryPaginationResult<IArticleDocument>>;
  findById(
    articleId: Types.ObjectId | string,
    options?: { populateAuthor?: boolean }
  ): Promise<IArticleDocument | null>;
  updateById(
    articleId: Types.ObjectId | string,
    updateData: UpdateQuery<IArticleDocument> | Partial<IArticle>
  ): Promise<IArticleDocument | null>;
  addBlockedBy(
    articleId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<IArticleDocument | null>;
  removeBlockedBy(
    articleId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<IArticleDocument | null>;
}
