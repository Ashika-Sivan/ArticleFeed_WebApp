import { Types, FilterQuery, Model } from 'mongoose';
import Article from '../models/Article.js';
import { IArticleDocument, IArticle } from '../types/index.js';
import { IArticleRepository, FeedQueryOptions } from '../interfaces/index.js';
import { BaseRepository } from './baseRepository.js';

export class ArticleRepository
  extends BaseRepository<IArticleDocument, Partial<IArticle>>
  implements IArticleRepository
{
  constructor(model: Model<IArticleDocument> = Article) {
    super(model);
  }

  async findFeedArticles({
    excludeAuthorId,
    blockedArticleIds = [],
    category,
    userPreferences = [],
    search,
  }: FeedQueryOptions): Promise<IArticleDocument[]> {
    const filter: FilterQuery<IArticleDocument> = {
      author: { $ne: excludeAuthorId },
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
      ];
    }

    return await this.model
      .find(filter)
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  async findByAuthor(authorId: Types.ObjectId | string): Promise<IArticleDocument[]> {
    return await this.model.find({ author: authorId }).sort({ createdAt: -1 });
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
}

