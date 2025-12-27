import { Cache } from '../config/redis';

// 注意：我们不再直接mock redisClient，而是通过测试Cache类的实际行为来验证其功能
// 因为Cache类内部依赖于isRedisConnected变量，而这个变量无法直接从外部访问或修改

describe('Cache Service', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
  });

  describe('基本缓存功能', () => {
    it('should handle Redis not connected gracefully', async () => {
      // 当Redis未连接时，所有方法都应该返回适当的默认值
      
      // 测试set方法
      const setResult = await Cache.set('test:key', 'test:value');
      expect(setResult).toBe(false);
      
      // 测试get方法
      const getResult = await Cache.get('test:key');
      expect(getResult).toBeNull();
      
      // 测试del方法
      const delResult = await Cache.del('test:key');
      expect(delResult).toBe(false);
      
      // 测试flush方法
      const flushResult = await Cache.flush();
      expect(flushResult).toBe(false);
      
      // 测试ttl方法
      const ttlResult = await Cache.ttl('test:key');
      expect(ttlResult).toBe(-2);
      
      // 测试exists方法
      const existsResult = await Cache.exists('test:key');
      expect(existsResult).toBe(false);
    });
    
    it('should handle hash operations when Redis not connected', async () => {
      // 测试hset方法
      const hsetResult = await Cache.hset('test:hash', 'field', 'value');
      expect(hsetResult).toBe(false);
      
      // 测试hget方法
      const hgetResult = await Cache.hget('test:hash', 'field');
      expect(hgetResult).toBeNull();
      
      // 测试hdel方法
      const hdelResult = await Cache.hdel('test:hash', 'field');
      expect(hdelResult).toBe(false);
    });
    
    it('should handle batch operations when Redis not connected', async () => {
      // 测试delBatch方法
      const delBatchResult = await Cache.delBatch(['key1', 'key2', 'key3']);
      expect(delBatchResult).toBe(false);
      
      // 测试delPattern方法
      const delPatternResult = await Cache.delPattern('test:*');
      expect(delPatternResult).toBe(false);
    });
  });
});
