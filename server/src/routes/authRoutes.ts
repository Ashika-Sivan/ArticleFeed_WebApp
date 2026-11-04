import { Router } from 'express';
import { authController, authMiddleware } from '../config/dependencies.js';
import { AUTH_ROUTES } from '../constants/index.js';

const router = Router();

router.post(AUTH_ROUTES.REGISTER, authController.registerUser);
router.post(AUTH_ROUTES.LOGIN, authController.loginUser);
router.post(AUTH_ROUTES.REFRESH, authController.refreshTokens);
router.post(AUTH_ROUTES.LOGOUT, authController.logoutUser);
router.get(AUTH_ROUTES.ME, authMiddleware.protect, authController.getMe);

export default router;
