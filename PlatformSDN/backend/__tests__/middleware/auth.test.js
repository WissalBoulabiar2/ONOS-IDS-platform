const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const authService = require('../../services/auth');
const { createMockRequest, createMockResponse } = require('../utils/test-helpers');

jest.mock('../../services/auth');

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    it('returns 401 when no bearer token is provided', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when token verification fails', () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer bad-token' },
      });
      const res = createMockResponse();
      const next = jest.fn();

      authService.verifyToken.mockReturnValue(null);

      authMiddleware(req, res, next);

      expect(authService.verifyToken).toHaveBeenCalledWith('bad-token');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('attaches the decoded user and calls next for valid tokens', () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const res = createMockResponse();
      const next = jest.fn();

      authService.verifyToken.mockReturnValue({ id: 7, role: 'admin' });

      authMiddleware(req, res, next);

      expect(req.user).toEqual({ id: 7, role: 'admin' });
      expect(next).toHaveBeenCalled();
    });
  });

  describe('roleMiddleware', () => {
    it('returns 401 when no authenticated user is present', () => {
      const middleware = roleMiddleware(['admin']);
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 403 when user role is not allowed', () => {
      const middleware = roleMiddleware(['admin']);
      const req = createMockRequest({ user: { id: 1, role: 'viewer' } });
      const res = createMockResponse();
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next when the user has a permitted role', () => {
      const middleware = roleMiddleware(['admin', 'operator']);
      const req = createMockRequest({ user: { id: 1, role: 'operator' } });
      const res = createMockResponse();
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
