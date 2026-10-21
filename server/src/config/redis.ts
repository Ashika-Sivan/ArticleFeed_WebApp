import { createClient, RedisClientType } from 'redis';

class RedisClient {
  private _client: RedisClientType | null = null;
  private _isConnected: boolean = false;

  constructor() {
    try {
      this._client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: () => false, // Stop immediately if Redis daemon is offline
        },
      });
      this._client.on('error', () => {
        this._isConnected = false;
      });
    } catch {
      this._client = null;
      this._isConnected = false;
    }
  }

  async connect(): Promise<void> {
    if (!this._client) return;
    try {
      await this._client.connect();
      this._isConnected = true;
      console.log('[Redis] Connected successfully to Redis server');
    } catch {
      this._isConnected = false;
      console.log('[Redis] Server unavailable; using in-memory store for OTP & caching.');
    }
  }

  get isConnected(): boolean {
    return this._isConnected && !!this._client?.isOpen;
  }

  getClient(): RedisClientType | null {
    return this._client;
  }
}

export const redisClient = new RedisClient();
export default redisClient;
