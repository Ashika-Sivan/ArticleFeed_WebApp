import { Types, FilterQuery, Model } from 'mongoose';
import Article from '../models/Article.js';
import { IArticleDocument, IArticle } from '../types/index.js';
import {
  IArticleRepository,
  FeedQueryOptions,
  AuthorQueryOptions,
  RepositoryPaginationResult,
} from '../interfaces/index.js';
import { BaseRepository } from './baseRepository.js';

export class ArticleRepository
  extends BaseRepository<IArticleDocument>
  implements IArticleRepository
{
  constructor(model: Model<IArticleDocument> = Article) {
    super(model);
  }

  async findFeedArticles({
    blockedArticleIds = [],
    category,
    userPreferences = [],
    search,
    page = 1,
    limit = 6,
  }: FeedQueryOptions): Promise<RepositoryPaginationResult<IArticleDocument>> {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 6));
    const skip = (pageNum - 1) * limitNum;

    const filter: FilterQuery<IArticleDocument> = {
      _id: { $nin: blockedArticleIds },
    };

    if (category && category !== 'All') {
      filter.category = category;
    } else if (userPreferences && userPreferences.length > 0) {
      filter.category = { $in: userPreferences };
    }

    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { tags: { $in: [new RegExp(term, 'i')] } },
        { category: { $regex: term, $options: 'i' } },
      ];
    }

    const [total, articles] = await Promise.all([
      this.model.countDocuments(filter),
      this.model
        .find(filter)
        .populate('author', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      articles,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }

  async findByAuthor(
    authorIdOrOptions: Types.ObjectId | string | AuthorQueryOptions
  ): Promise<RepositoryPaginationResult<IArticleDocument>> {
    let authorId: Types.ObjectId | string;
    let search: string | undefined;
    let page = 1;
    let limit = 6;

    if (typeof authorIdOrOptions === 'object' && 'authorId' in authorIdOrOptions) {
      authorId = authorIdOrOptions.authorId;
      search = authorIdOrOptions.search;
      page = authorIdOrOptions.page || 1;
      limit = authorIdOrOptions.limit || 6;
    } else {
      authorId = authorIdOrOptions;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 6));
    const skip = (pageNum - 1) * limitNum;

    const filter: FilterQuery<IArticleDocument> = {
      author: authorId,
    };

    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { tags: { $in: [new RegExp(term, 'i')] } },
        { category: { $regex: term, $options: 'i' } },
      ];
    }

    const [total, articles] = await Promise.all([
      this.model.countDocuments(filter),
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      articles,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }

  async findById(
    articleId: Types.ObjectId | string,
    options: { populateAuthor?: boolean } = {}
  ): Promise<IArticleDocument | null> {
    let query = this.model.findById(articleId);
    if (options.populateAuthor) {
      query = query.populate('author', 'firstName lastName email');
    }
    return await query;
  }

  async updateById(
    articleId: Types.ObjectId | string,
    updateData: Partial<IArticle>
  ): Promise<IArticleDocument | null> {
    return await this.model.findByIdAndUpdate(articleId, updateData, { new: true });
  }

  async addBlockedBy(
    articleId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<IArticleDocument | null> {
    return await this.model.findByIdAndUpdate(articleId, {
      $addToSet: { blockedBy: userId },
    });
  }

  async removeBlockedBy(
    articleId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<IArticleDocument | null> {
    return await this.model.findByIdAndUpdate(articleId, {
      $pull: { blockedBy: userId },
    });
  }

  async findBlockedArticles(options: {
    articleIds: (Types.ObjectId | string)[];
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<RepositoryPaginationResult<IArticleDocument>> {
    const { articleIds, search, page = 1, limit = 10 } = options;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    if (!articleIds || articleIds.length === 0) {
      return {
        articles: [],
        total: 0,
        page: pageNum,
        limit: limitNum,
        totalPages: 1,
      };
    }

    const filter: FilterQuery<IArticleDocument> = {
      _id: { $in: articleIds },
    };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } },
      ];
    }

    const [articles, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('author', 'firstName lastName email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      this.model.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      articles,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}
