import Redis from 'ioredis';

// 创建Redis客户端
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  // 连接超时设置
  connectTimeout: 5000,
  // 重试策略
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// 监听Redis连接事件
redisClient.on('connect', () => {
  console.log('Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// 缓存工具类
class Cache {
  // 设置缓存
  static async set(key: string, value: any, expiresIn: number = 3600): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.set(key, serializedValue, 'EX', expiresIn);
      return true;
    } catch (error) {
      console.error('Error setting cache:', error);
      return false;
    }
  }

  // 获取缓存
  static async get(key: string): Promise<any | null> {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  // 删除缓存
  static async del(key: string): Promise<boolean> {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Error deleting cache:', error);
      return false;
    }
  }

  // 清除所有缓存
  static async flush(): Promise<boolean> {
    try {
      await redisClient.flushdb();
      return true;
    } catch (error) {
      console.error('Error flushing cache:', error);
      return false;
    }
  }

  // 设置哈希缓存
  static async hset(key: string, field: string, value: any, expiresIn: number = 3600): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.hset(key, field, serializedValue);
      // 设置哈希表的过期时间
      await redisClient.expire(key, expiresIn);
      return true;
    } catch (error) {
      console.error('Error setting hash cache:', error);
      return false;
    }
  }

  // 获取哈希缓存
  static async hget(key: string, field: string): Promise<any | null> {
    try {
      const value = await redisClient.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting hash cache:', error);
      return null;
    }
  }

  // 删除哈希缓存中的字段
  static async hdel(key: string, field: string): Promise<boolean> {
    try {
      await redisClient.hdel(key, field);
      return true;
    } catch (error) {
      console.error('Error deleting hash cache field:', error);
      return false;
    }
  }

  // 批量删除缓存
  static async delBatch(keys: string[]): Promise<boolean> {
    try {
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Error deleting batch cache:', error);
      return false;
    }
  }

  // 模糊删除缓存
  static async delPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Error deleting pattern cache:', error);
      return false;
    }
  }

  // 获取缓存TTL
  static async ttl(key: string): Promise<number> {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      console.error('Error getting cache TTL:', error);
      return -2; // -2 means key doesn't exist
    }
  }

  // 检查缓存是否存在
  static async exists(key: string): Promise<boolean> {
    try {
      return (await redisClient.exists(key)) > 0;
    } catch (error) {
      console.error('Error checking cache existence:', error);
      return false;
    }
  }
}

export { redisClient, Cache };
