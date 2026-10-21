import { Types } from 'mongoose';
import {
  CreateArticleDTO,
  UpdateArticleDTO,
  FeedQueryParams,
  IArticleDocument,
  IUser,
} from '../types/index.js';
import {
  IArticleRepository,
  IUserRepository,
  IArticleService,
  ToggleReactionResult,
} from '../interfaces/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { MESSAGES } from '../constants/index.js';

export const getAuthorId = (author: Types.ObjectId | IUser): string => {
  if (author instanceof Types.ObjectId) {
    return author.toString();
  }
  if (author && typeof author === 'object' && '_id' in author) {
    return (author as IUser)._id.toString();
  }
  return String(author);
};

export class ArticleService implements IArticleService {
  constructor(
    private readonly articleRepo: IArticleRepository,
    private readonly userRepo: IUserRepository
  ) {}

  async getFeedArticles(
    userId: string | Types.ObjectId,
    { category, search }: FeedQueryParams
  ): Promise<{ articles: IArticleDocument[]; userPreferences: string[] }> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      const error: AppError = new Error(MESSAGES.USER.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    const articles = await this.articleRepo.findFeedArticles({
      excludeAuthorId: user._id,
      blockedArticleIds: user.blockedArticles || [],
      category,
      userPreferences: user.preferences,
      search,
    });

    return {
      articles,
      userPreferences: user.preferences,
    };
  }

  async toggleLike(
    articleId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<ToggleReactionResult> {
    const article = await this.articleRepo.findById(articleId);
    if (!article) {
      const error: AppError = new Error(MESSAGES.ARTICLE.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const isLiked = article.likes.some((id: Types.ObjectId) => id.toString() === userId.toString());
    const isDisliked = article.dislikes.some((id: Types.ObjectId) => id.toString() === userId.toString());

    if (isDisliked) {
      article.dislikes = article.dislikes.filter((id: Types.ObjectId) => id.toString() !== userId.toString());
    }

    if (isLiked) {
      article.likes = article.likes.filter((id: Types.ObjectId) => id.toString() !== userId.toString());
    } else {
      article.likes.push(userObjId);
    }

    await this.articleRepo.save(article);

    return {
      likesCount: article.likes.length,
      dislikesCount: article.dislikes.length,
      isLiked: !isLiked,
      isDisliked: false,
    };
  }

  async toggleDislike(
    articleId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<ToggleReactionResult> {
    const article = await this.articleRepo.findById(articleId);
    if (!article) {
      const error: AppError = new Error(MESSAGES.ARTICLE.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const isLiked = article.likes.some((id: Types.ObjectId) => id.toString() === userId.toString());
    const isDisliked = article.dislikes.some((id: Types.ObjectId) => id.toString() === userId.toString());

    if (isLiked) {
      article.likes = article.likes.filter((id: Types.ObjectId) => id.toString() !== userId.toString());
    }

    if (isDisliked) {
      article.dislikes = article.dislikes.filter((id: Types.ObjectId) => id.toString() !== userId.toString());
    } else {
      article.dislikes.push(userObjId);
    }

    await this.articleRepo.save(article);

    return {
      likesCount: article.likes.length,
      dislikesCount: article.dislikes.length,
      isLiked: false,
      isDisliked: !isDisliked,
    };
  }

  async blockArticle(
    articleId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<{ message: string }> {
    const article = await this.articleRepo.findById(articleId);
    if (!article) {
      const error: AppError = new Error(MESSAGES.ARTICLE.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    await this.userRepo.addBlockedArticle(userId, article._id);
    await this.articleRepo.addBlockedBy(article._id, userId);

    return { message: MESSAGES.ARTICLE.BLOCKED_SUCCESS };
  }

  async createArticle(
    userId: string | Types.ObjectId,
    data: CreateArticleDTO
  ): Promise<IArticleDocument> {
    const { title, description, images, tags, category } = data;

    if (!title || !description || !category) {
      const error: AppError = new Error(MESSAGES.ARTICLE.REQUIRED_FIELDS);
      error.statusCode = 400;
      throw error;
    }

    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    const article = await this.articleRepo.create({
      title: title.trim(),
      description: description.trim(),
      images: Array.isArray(images) ? images : images ? [images] : [],
      tags: Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      category,
      author: userObjId,
    });

    return article;
  }

  async getMyArticles(userId: string | Types.ObjectId): Promise<IArticleDocument[]> {
    return await this.articleRepo.findByAuthor(userId);
  }

  async getArticleById(articleId: string | Types.ObjectId): Promise<IArticleDocument> {
    const article = await this.articleRepo.findById(articleId, { populateAuthor: true });
    if (!article) {
      const error: AppError = new Error(MESSAGES.ARTICLE.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }
    return article;
  }

  async updateArticle(
    articleId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    data: UpdateArticleDTO
  ): Promise<IArticleDocument> {
    const article = await this.articleRepo.findById(articleId);
    if (!article) {
      const error: AppError = new Error(MESSAGES.ARTICLE.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    const authorIdStr = getAuthorId(article.author);

    if (authorIdStr !== userId.toString()) {
      const error: AppError = new Error(MESSAGES.ARTICLE.NOT_AUTHORIZED_TO_EDIT);
      error.statusCode = 403;
      throw error;
    }

    const { title, description, images, tags, category } = data;
    if (title) article.title = title.trim();
    if (description) article.description = description.trim();
    if (images !== undefined) article.images = Array.isArray(images) ? images : [images];
    if (tags !== undefined) {
      article.tags = Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
    }
    if (category) article.category = category;

    await this.articleRepo.save(article);
    return article;
  }

  async deleteArticle(
    articleId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<{ message: string }> {
    const article = await this.articleRepo.findById(articleId);
    if (!article) {
      const error: AppError = new Error(MESSAGES.ARTICLE.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    const authorIdStr = getAuthorId(article.author);

    if (authorIdStr !== userId.toString()) {
      const error: AppError = new Error(MESSAGES.ARTICLE.NOT_AUTHORIZED_TO_DELETE);
      error.statusCode = 403;
      throw error;
    }

    await this.articleRepo.deleteById(articleId);
    return { message: MESSAGES.ARTICLE.DELETED_SUCCESS };
  }
}
