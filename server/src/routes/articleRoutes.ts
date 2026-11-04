import { Router } from 'express';
import { articleController, authMiddleware } from '../config/dependencies.js';
import { ARTICLE_ROUTES } from '../constants/index.js';

const router = Router();


router.get(ARTICLE_ROUTES.FEED, authMiddleware.protect, articleController.getFeedArticles);
router.get(ARTICLE_ROUTES.BLOCKED, authMiddleware.protect, articleController.getBlockedArticles);
router.post(ARTICLE_ROUTES.LIKE, authMiddleware.protect, articleController.toggleLikeArticle);
router.post(ARTICLE_ROUTES.DISLIKE, authMiddleware.protect, articleController.toggleDislikeArticle);
router.post(ARTICLE_ROUTES.BLOCK, authMiddleware.protect, articleController.blockArticle);
router.post(ARTICLE_ROUTES.UNBLOCK, authMiddleware.protect, articleController.unblockArticle);


router.get(ARTICLE_ROUTES.MY_ARTICLES, authMiddleware.protect, articleController.getMyArticles);
router.post(ARTICLE_ROUTES.ROOT, authMiddleware.protect, articleController.createArticle);
router.get(ARTICLE_ROUTES.BY_ID, articleController.getArticleById);
router.put(ARTICLE_ROUTES.BY_ID, authMiddleware.protect, articleController.updateArticle);
router.delete(ARTICLE_ROUTES.BY_ID, authMiddleware.protect, articleController.deleteArticle);

export default router;
