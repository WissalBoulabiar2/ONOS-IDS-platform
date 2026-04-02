// PlatformSDN/backend/middleware/rate-limiter-advanced.js - Advanced rate limiting
const db = require('../db');

class AdvancedRateLimiter {
  constructor() {
    this.limits = new Map();
    this.rules = [
      { endpoint: '/api/auth/login', maxRequests: 5, windowMs: 15 * 60 * 1000 },
      { endpoint: '/api/auth/register', maxRequests: 3, windowMs: 60 * 60 * 1000 },
      { endpoint: '/api/onos', maxRequests: 100, windowMs: 60 * 1000 },
      { endpoint: '/api/users', maxRequests: 50, windowMs: 60 * 1000 },
      { default: 1000, windowMs: 60 * 1000 }, // Default: 1000 requests per minute
    ];
  }

  middleware() {
    return (req, res, next) => {
      const key = this.getKey(req);
      const limit = this.getLimit(req.path);

      const current = this.limits.get(key) || { count: 0, resetTime: Date.now() + limit.windowMs };

      // Check if window has expired
      if (Date.now() >= current.resetTime) {
        current.count = 0;
        current.resetTime = Date.now() + limit.windowMs;
      }

      // Increment counter
      current.count++;
      this.limits.set(key, current);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', limit.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit.maxRequests - current.count));
      res.setHeader('X-RateLimit-Reset', new Date(current.resetTime).toISOString());

      // Check if limit exceeded
      if (current.count > limit.maxRequests) {
        this.logRateLimitViolation(req, current.count, limit.maxRequests);

        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((current.resetTime - Date.now()) / 1000),
        });
      }

      next();
    };
  }

  getKey(req) {
    // Use combination of IP and user ID if authenticated
    const ip = req.ip || req.connection.remoteAddress;
    const userId = req.user?.id || 'anonymous';
    return `${ip}:${userId}:${req.path}`;
  }

  getLimit(path) {
    for (const rule of this.rules) {
      if (rule.endpoint && path.includes(rule.endpoint)) {
        return { maxRequests: rule.maxRequests, windowMs: rule.windowMs };
      }
    }

    return { maxRequests: this.rules.default, windowMs: this.rules.windowMs };
  }

  logRateLimitViolation(req, currentCount, limit) {
    console.warn(
      `[RateLimit] Violation: ${req.method} ${req.path} from ${req.ip} (${currentCount}/${limit})`
    );
  }

  // Clean up old entries
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.limits) {
      if (now > value.resetTime + 60000) {
        // Remove entries 1 minute after reset
        this.limits.delete(key);
      }
    }
  }
}

// Run cleanup every 5 minutes
const limiter = new AdvancedRateLimiter();
setInterval(() => limiter.cleanup(), 5 * 60 * 1000);

module.exports = limiter;
