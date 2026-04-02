// PlatformSDN/backend/__tests__/services/auth.test.js
const auth = require('../../services/auth');
const bcrypt = require('bcryptjs');

describe('Auth Service', () => {
  describe('hashPassword', () => {
    test('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await auth.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('verifyPassword', () => {
    test('should verify a correct password', async () => {
      const password = 'testPassword123';
      const hash = await auth.hashPassword(password);
      const isValid = await auth.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    test('should reject an incorrect password', async () => {
      const password = 'testPassword123';
      const hash = await auth.hashPassword(password);
      const isValid = await auth.verifyPassword('wrongPassword', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    test('should generate a valid JWT token', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      };

      const token = auth.generateToken(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT should have 3 parts
    });
  });

  describe('verifyToken', () => {
    test('should verify a valid token', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      };

      const token = auth.generateToken(user);
      const decoded = auth.verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(user.id);
      expect(decoded.username).toBe(user.username);
    });

    test('should reject an invalid token', () => {
      const decoded = auth.verifyToken('invalid.token.here');
      expect(decoded).toBeNull();
    });
  });

  describe('sanitizeUser', () => {
    test('should remove sensitive data from user object', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user',
        is_active: true,
        last_login: '2026-04-02T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
        password_hash: 'should_be_removed',
      };

      const sanitized = auth.sanitizeUser(user);

      expect(sanitized.id).toBe(1);
      expect(sanitized.username).toBe('testuser');
      expect(sanitized.password_hash).toBeUndefined();
    });
  });
});
