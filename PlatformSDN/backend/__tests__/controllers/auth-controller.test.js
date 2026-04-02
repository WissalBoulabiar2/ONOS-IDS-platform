// PlatformSDN/backend/__tests__/controllers/auth-controller.test.js
const authController = require('../../controllers/auth-controller');
const authService = require('../../services/auth');
const auditService = require('../../services/audit-logs');
const db = require('../../db');

jest.mock('../../services/auth');
jest.mock('../../services/audit-logs');
jest.mock('../../db');

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: null,
      ip: '127.0.0.1',
      get: jest.fn(() => 'Mozilla/5.0'),
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return 400 if username or password is missing', async () => {
      req.body = { username: 'user' };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Username and password required',
      });
    });

    it('should return 401 if credentials are invalid', async () => {
      req.body = { username: 'user', password: 'wrong' };
      authService.authenticate.mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });

    it('should return token and user if credentials are valid', async () => {
      const user = { id: 1, username: 'user', email: 'user@test.com', role: 'user', full_name: 'Test User' };
      req.body = { username: 'user', password: 'correct' };
      authService.authenticate.mockResolvedValue(user);
      authService.generateToken.mockReturnValue('token123');

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'token123',
          user: expect.objectContaining({
            id: 1,
            username: 'user',
          }),
        })
      );
    });
  });

  describe('register', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body = { username: 'user' };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 409 if user already exists', async () => {
      req.body = { username: 'user', email: 'user@test.com', password: 'pass' };
      db.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User already exists',
      });
    });

    it('should create user and return token', async () => {
      const newUser = { id: 2, username: 'newuser', email: 'new@test.com', role: 'user', full_name: 'New User' };
      req.body = { username: 'newuser', email: 'new@test.com', password: 'pass', fullName: 'New User' };
      db.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing user
        .mockResolvedValueOnce({ rows: [newUser] }); // Create user
      authService.hashPassword.mockResolvedValue('hashedpass');
      authService.generateToken.mockReturnValue('token456');

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'token456',
          user: expect.objectContaining({
            id: 2,
            username: 'newuser',
          }),
        })
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return 401 if user is not authenticated', async () => {
      req.user = null;

      await authController.getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return current user if authenticated', async () => {
      req.user = { id: 1, username: 'user', email: 'user@test.com', role: 'user', full_name: 'Test User' };

      await authController.getCurrentUser(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            id: 1,
            username: 'user',
          }),
        })
      );
    });
  });

  describe('logout', () => {
    it('should log audit entry and return success', async () => {
      req.user = { id: 1, username: 'user' };

      await authController.logout(req, res);

      expect(auditService.logAction).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });
  });
});
