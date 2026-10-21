import { Types } from 'mongoose';
import { IArticleDocument, IArticle } from '../../types/index.js';
import { IWriteRepository } from './IBaseRepository.js';

export interface FeedQueryOptions {
  excludeAuthorId: Types.ObjectId | string;
  blockedArticleIds?: (Types.ObjectId | string)[];
  category?: string;
  userPreferences?: string[];
  search?: string;
}

export interface IArticleReader {
  findFeedArticles(options: FeedQueryOptions): Promise<IArticleDocument[]>;
  findByAuthor(authorId: Types.ObjectId | string): Promise<IArticleDocument[]>;
  findById(
    articleId: Types.ObjectId | string,
    options?: { populateAuthor?: boolean }
  ): Promise<IArticleDocument | null>;
}

export interface IArticleWriter extends IWriteRepository<IArticleDocument, Partial<IArticle>> {
  updateById(
    articleId: Types.ObjectId | string,
    updateData: Partial<IArticle>
  ): Promise<IArticleDocument | null>;
  addBlockedBy(
    articleId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<IArticleDocument | null>;
}

export interface IArticleRepository extends IArticleReader, IArticleWriter {}
