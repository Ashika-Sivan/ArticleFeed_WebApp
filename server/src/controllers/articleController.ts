import { Request, Response } from 'express';
import { IArticleService } from '../interfaces/index.js';
import { AuthRequest } from '../types/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import { MESSAGES } from '../constants/index.js';

const getParamId = (id: string | string[] | undefined): string => {
  if (Array.isArray(id)) return id[0];
  return id || '';
};

export class ArticleController {
  constructor(private readonly articleServ: IArticleService) {}

  getFeedArticles = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: MESSAGES.AUTH.UNAUTHENTICATED });
      return;
    }
    const result = await this.articleServ.getFeedArticles(req.user._id, req.query);
    res.status(200).json({
      success: true,
      count: result.articles.length,
      ...result,
    });
  });

  toggleLikeArticle = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: MESSAGES.AUTH.UNAUTHENTICATED });
      return;
    }
    const result = await this.articleServ.toggleLike(getParamId(req.params.id), req.user._id);
    res.status(200).json({
      success: true,
      ...result,
    });
  });

  toggleDislikeArticle = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: MESSAGES.AUTH.UNAUTHENTICATED });
      return;
    }
    const result = await this.articleServ.toggleDislike(getParamId(req.params.id), req.user._id);
    res.status(200).json({
      success: true,
      ...result,
    });
  });

  blockArticle = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: MESSAGES.AUTH.UNAUTHENTICATED });
      return;
    }
    const result = await this.articleServ.blockArticle(getParamId(req.params.id), req.user._id);
    res.status(200).json({
      success: true,
      ...result,
    });
  });

  createArticle = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: MESSAGES.AUTH.UNAUTHENTICATED });
      return;
    }
    const article = await this.articleServ.createArticle(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: MESSAGES.ARTICLE.PUBLISHED_SUCCESS,
      article,
    });
  });

  getMyArticles = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: MESSAGES.AUTH.UNAUTHENTICATED });
      return;
    }
    const articles = await this.articleServ.getMyArticles(req.user._id);
    res.status(200).json({
      success: true,
      articles,
    });
  });

  getArticleById = asyncHandler(async (req: Request, res: Response) => {
    const article = await this.articleServ.getArticleById(getParamId(req.params.id));
    res.status(200).json({
      success: true,
      article,
    });
  });

  updateArticle = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: MESSAGES.AUTH.UNAUTHENTICATED });
      return;
    }
    const article = await this.articleServ.updateArticle(
      getParamId(req.params.id),
      req.user._id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: MESSAGES.ARTICLE.UPDATED_SUCCESS,
      article,
    });
  });

  deleteArticle = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: MESSAGES.AUTH.UNAUTHENTICATED });
      return;
    }
    const result = await this.articleServ.deleteArticle(
      getParamId(req.params.id),
      req.user._id
    );
    res.status(200).json({
      success: true,
      ...result,
    });
  });
}
