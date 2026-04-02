// PlatformSDN/backend/__tests__/db.test.js
describe('Database Module', () => {
  let db;

  beforeEach(() => {
    // Reset module cache before each test
    jest.resetModules();
    db = require('../db');
  });

  describe('Pool Management', () => {
    test('should export required functions', () => {
      expect(typeof db.initializePool).toBe('function');
      expect(typeof db.query).toBe('function');
      expect(typeof db.closePool).toBe('function');
      expect(typeof db.isDatabaseReady).toBe('function');
      expect(typeof db.getLastError).toBe('function');
    });

    test('should report database as not ready initially', () => {
      expect(db.isDatabaseReady()).toBe(false);
    });

    test('should throw error when querying before initialization', async () => {
      await expect(db.query('SELECT 1')).rejects.toThrow('Database pool not initialized');
    });
  });

  describe('Configuration', () => {
    test('should use environment variables for configuration', () => {
      jest.resetModules();
      process.env.DB_USER = 'testuser';
      process.env.DB_HOST = 'testhost';

      // This test verifies the config module respects env vars
      const config = require('../config');
      expect(config.DATABASE.user).toBe('testuser');
      expect(config.DATABASE.host).toBe('testhost');
    });
  });
});
