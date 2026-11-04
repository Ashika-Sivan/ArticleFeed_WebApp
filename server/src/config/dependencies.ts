import { UserRepository } from '../repositories/userRepository.js';
import { ArticleRepository } from '../repositories/articleRepository.js';
import { TokenService } from '../services/tokenService.js';
import { AuthService } from '../services/authService.js';
import { UserService } from '../services/userService.js';
import { ArticleService } from '../services/articleService.js';
import { AuthController } from '../controllers/authController.js';
import { UserController } from '../controllers/userController.js';
import { ArticleController } from '../controllers/articleController.js';
import { AuthMiddleware } from '../middleware/authMiddleware.js';


const userRepository = new UserRepository();
const articleRepository = new ArticleRepository();
const tokenService = new TokenService();


const authService = new AuthService(userRepository, tokenService);
const userService = new UserService(userRepository);
const articleService = new ArticleService(articleRepository, userRepository);
export const authMiddleware = new AuthMiddleware(tokenService, userRepository);
export const authController = new AuthController(authService, tokenService);
export const userController = new UserController(userService);
export const articleController = new ArticleController(articleService);

export {
  userRepository,
  articleRepository,
  tokenService,
  authService,
  userService,
  articleService,
};

