import { Types } from 'mongoose';
import {
  CreateArticleDTO,
  UpdateArticleDTO,
  FeedQueryParams,
  MyArticlesQueryParams,
  IArticleDocument,
  PaginationMeta,
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
  ) { }

  async getFeedArticles(
    userId: string | Types.ObjectId,
    { category, search, page, limit }: FeedQueryParams
  ): Promise<{
    articles: IArticleDocument[];
    userPreferences: string[];
    pagination: PaginationMeta;
  }> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      const error: AppError = new Error(MESSAGES.USER.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 6));

    const result = await this.articleRepo.findFeedArticles({
      blockedArticleIds: user.blockedArticles || [],
      category,
      userPreferences: user.preferences,
      search,
      page: pageNum,
      limit: limitNum,
    });

    return {
      articles: result.articles,
      userPreferences: user.preferences,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
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

  async unblockArticle(
    articleId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<{ message: string }> {
    const article = await this.articleRepo.findById(articleId);
    if (!article) {
      const error: AppError = new Error(MESSAGES.ARTICLE.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    await this.userRepo.removeBlockedArticle(userId, article._id);
    await this.articleRepo.removeBlockedBy(article._id, userId);

    return { message: MESSAGES.ARTICLE.UNBLOCKED_SUCCESS };
  }

  async getBlockedArticles(
    userId: string | Types.ObjectId,
    query: { page?: number; limit?: number; search?: string } = {}
  ): Promise<{
    articles: IArticleDocument[];
    pagination: PaginationMeta;
  }> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      const error: AppError = new Error(MESSAGES.USER.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    const pageNum = Math.max(1, Number(query.page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(query.limit) || 10));

    const result = await this.articleRepo.findBlockedArticles({
      articleIds: user.blockedArticles || [],
      search: query.search,
      page: pageNum,
      limit: limitNum,
    });

    return {
      articles: result.articles,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    };
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

  async getMyArticles(
    userId: string | Types.ObjectId,
    query?: MyArticlesQueryParams
  ): Promise<{
    articles: IArticleDocument[];
    pagination: PaginationMeta;
  }> {
    const pageNum = Math.max(1, Number(query?.page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(query?.limit) || 6));

    const result = await this.articleRepo.findByAuthor({
      authorId: userId,
      search: query?.search,
      page: pageNum,
      limit: limitNum,
    });

    return {
      articles: result.articles,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    };
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
