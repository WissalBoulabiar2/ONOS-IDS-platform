// PlatformSDN/backend/middleware/cache.js - Response caching middleware
const crypto = require('crypto');

class CacheMiddleware {
  constructor() {
    this.cache = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Generate cache key from request
   */
  generateCacheKey(method, url, userId = null) {
    const key = `${method}:${url}:${userId || 'anonymous'}`;
    return crypto.createHash('md5').update(key).digest('hex');
  }

  /**
   * Cache middleware function
   */
  middleware(ttl = 300) {
    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = this.generateCacheKey(req.method, req.originalUrl, req.user?.id);

      // Check cache
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        this.cacheHits++;
        return res.json(cached.data);
      }

      this.cacheMisses++;

      // Override res.json to cache response
      const originalJson = res.json.bind(res);
      res.json = function (data) {
        this.cache.set(cacheKey, {
          data,
          expiresAt: Date.now() + ttl * 1000,
        });

        res.set('X-Cache', 'MISS');
        return originalJson(data);
      }.bind(this);

      next();
    };
  }

  /**
   * Invalidate cache entries
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.cacheHits + this.cacheMisses;
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: total > 0 ? ((this.cacheHits / total) * 100).toFixed(2) + '%' : '0%',
      size: this.cache.size,
    };
  }
}

module.exports = new CacheMiddleware();
