import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/article_feeds_db'
    );
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
