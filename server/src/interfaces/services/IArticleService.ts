import { Types } from 'mongoose';
import {
  CreateArticleDTO,
  UpdateArticleDTO,
  FeedQueryParams,
  IArticleDocument,
} from '../../types/index.js';

export interface ToggleReactionResult {
  likesCount: number;
  dislikesCount: number;
  isLiked: boolean;
  isDisliked: boolean;
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
