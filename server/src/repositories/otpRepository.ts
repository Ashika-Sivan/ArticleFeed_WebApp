import { redisClient } from '../config/redis.js';
import { IOtpRepository } from '../interfaces/index.js';

export const OTP_EXPIRY_SECONDS = Number(process.env.OTP_EXPIRY_SECONDS) || 300;

interface MemoryOtpRecord {
  otp: string;
  expiresAt: number;
}

export class OtpRepository implements IOtpRepository {
  private _redisClient: ReturnType<typeof redisClient.getClient>;
  private _memoryStore: Map<string, MemoryOtpRecord> = new Map();

  constructor(redis: ReturnType<typeof redisClient.getClient>) {
    this._redisClient = redis;
  }

  async storeOtp(email: string, otp: string): Promise<void> {
    const key = email.toLowerCase().trim();
    if (redisClient.isConnected && this._redisClient) {
      try {
        await this._redisClient.set(`otp:${key}`, otp, {
          EX: OTP_EXPIRY_SECONDS,
        });
        return;
      } catch {
        console.warn('[OtpRepository] Redis write failed, falling back to memory store.');
      }
    }
    this._memoryStore.set(key, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_SECONDS * 1000,
    });
  }

  async getOtp(email: string): Promise<string | null> {
    const key = email.toLowerCase().trim();
    if (redisClient.isConnected && this._redisClient) {
      try {
        const val = await this._redisClient.get(`otp:${key}`);
        if (val) return val;
      } catch {
        console.warn('[OtpRepository] Redis read failed, falling back to memory store.');
      }
    }
    const record = this._memoryStore.get(key);
    if (!record) return null;
    if (Date.now() > record.expiresAt) {
      this._memoryStore.delete(key);
      return null;
    }
    return record.otp;
  }

  async deleteOtp(email: string): Promise<void> {
    const key = email.toLowerCase().trim();
    if (redisClient.isConnected && this._redisClient) {
      try {
        await this._redisClient.del(`otp:${key}`);
      } catch {
        // ignore
      }
    }
    this._memoryStore.delete(key);
  }
}

