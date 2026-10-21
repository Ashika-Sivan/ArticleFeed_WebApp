import { Router } from 'express';
import { userController, authMiddleware } from '../config/dependencies.js';
import { USER_ROUTES } from '../constants/index.js';

const router = Router();

router.use(authMiddleware.protect);

router.put(USER_ROUTES.PROFILE, userController.updateProfile);
router.put(USER_ROUTES.CHANGE_PASSWORD, userController.changePassword);
router.put(USER_ROUTES.PREFERENCES, userController.updatePreferences);

export default router;
