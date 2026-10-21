import mongoose, { Schema, Model } from 'mongoose';
import { CATEGORIES } from '../constants/categories.js';
import { IArticleDocument } from '../types/index.js';

const articleSchema = new Schema<IArticleDocument>(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Article description / content is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Article category is required'],
      enum: CATEGORIES,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    blockedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

articleSchema.index({ category: 1, createdAt: -1 });
articleSchema.index({ author: 1 });

export const Article: Model<IArticleDocument> = mongoose.model<IArticleDocument>(
  'Article',
  articleSchema
);
export default Article;
