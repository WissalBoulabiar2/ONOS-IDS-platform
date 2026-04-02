// PlatformSDN/backend/__tests__/middleware/rate-limiter.test.js
const rateLimiter = require('../../middleware/rate-limiter-advanced');
const { createMockRequest, createMockResponse } = require('../utils/test-helpers');

describe('AdvancedRateLimiter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    rateLimiter.limits.clear();
  });

  describe('middleware', () => {
    it('should allow requests within limit', (done) => {
      const middleware = rateLimiter.middleware();
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', expect.any(Number));
      done();
    });

    it('should reject requests exceeding limit', (done) => {
      const middleware = rateLimiter.middleware();
      const req = createMockRequest();
      const res = createMockResponse();

      // Simulate max requests for login endpoint
      jest.spyOn(rateLimiter, 'getLimit').mockReturnValue({ maxRequests: 2, windowMs: 60000 });
      jest.spyOn(rateLimiter, 'getKey').mockReturnValue('test_key');

      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        middleware(req, res, jest.fn());
      }

      // Third request should be rejected
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Too many requests',
        })
      );

      done();
    });

    it('should set rate limit headers', (done) => {
      const middleware = rateLimiter.middleware();
      const req = createMockRequest();
      const res = createMockResponse();

      middleware(req, res, jest.fn());

      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', expect.any(Number));
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));

      done();
    });
  });

  describe('getKey', () => {
    it('should generate key from IP, user ID, and path', () => {
      const req = createMockRequest();
      const key = rateLimiter.getKey(req);

      expect(key).toContain('127.0.0.1');
      expect(key).toContain('anonymous');
    });

    it('should include user ID if authenticated', () => {
      const req = createMockRequest({ user: { id: 123 } });
      const key = rateLimiter.getKey(req);

      expect(key).toContain('123');
    });
  });

  describe('getLimit', () => {
    it('should return specific limit for login endpoint', () => {
      const limit = rateLimiter.getLimit('/api/auth/login');

      expect(limit.maxRequests).toBe(5);
      expect(limit.windowMs).toBe(15 * 60 * 1000);
    });

    it('should return specific limit for register endpoint', () => {
      const limit = rateLimiter.getLimit('/api/auth/register');

      expect(limit.maxRequests).toBe(3);
      expect(limit.windowMs).toBe(60 * 60 * 1000);
    });

    it('should return default limit for unknown endpoints', () => {
      const limit = rateLimiter.getLimit('/api/unknown');

      expect(limit.maxRequests).toBe(1000);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', () => {
      rateLimiter.limits.set('test_key', { count: 5, resetTime: Date.now() - 61000 });

      rateLimiter.cleanup();

      expect(rateLimiter.limits.has('test_key')).toBe(false);
    });

    it('should keep non-expired entries', () => {
      rateLimiter.limits.set('test_key', { count: 5, resetTime: Date.now() + 60000 });

      rateLimiter.cleanup();

      expect(rateLimiter.limits.has('test_key')).toBe(true);
    });
  });
});
