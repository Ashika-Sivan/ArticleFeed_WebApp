export const CATEGORIES = [
  'Sports',
  'Politics',
  'Space',
  'Technology',
  'Business',
  'Entertainment',
  'Science',
  'Health',
  'Other',
] as const;

export type CategoryType = (typeof CATEGORIES)[number];
