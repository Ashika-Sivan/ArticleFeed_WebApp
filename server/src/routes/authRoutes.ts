import { Router } from 'express';
import { authController, authMiddleware } from '../config/dependencies.js';
import { AUTH_ROUTES } from '../constants/index.js';

const router = Router();

router.post(AUTH_ROUTES.REGISTER, authController.registerUser);
router.post(AUTH_ROUTES.LOGIN, authController.loginUser);
router.post(AUTH_ROUTES.LOGOUT, authController.logoutUser);
router.post(AUTH_ROUTES.VERIFY_OTP, authController.verifyOtp);
router.post(AUTH_ROUTES.RESEND_OTP, authController.resendOtp);
router.get(AUTH_ROUTES.ME, authMiddleware.protect, authController.getMe);

export default router;
