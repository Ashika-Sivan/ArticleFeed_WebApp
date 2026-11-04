export const API_PREFIXES = {
  AUTH: '/api/auth',
  ARTICLES: '/api/articles',
  USERS: '/api/users',
  HEALTH: '/api/health',
} as const;

export const AUTH_ROUTES = {
  ROOT: '/',
  REGISTER: '/register',
  LOGIN: '/login',
  REFRESH: '/refresh',
  LOGOUT: '/logout',
  ME: '/me',
  VERIFY_OTP: '/verify-otp',
  RESEND_OTP: '/resend-otp',
} as const;

export const USER_ROUTES = {
  ROOT: '/',
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/change-password',
  PREFERENCES: '/preferences',
} as const;

export const ARTICLE_ROUTES = {
  ROOT: '/',
  FEED: '/feed',
  MY_ARTICLES: '/my',
  BLOCKED: '/blocked',
  BY_ID: '/:id',
  LIKE: '/:id/like',
  DISLIKE: '/:id/dislike',
  BLOCK: '/:id/block',
  UNBLOCK: '/:id/unblock',
} as const;
