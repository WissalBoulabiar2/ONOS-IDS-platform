// PlatformSDN/backend/__tests__/setup.js - Test setup and utilities
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'sdn_platform_test';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.JWT_SECRET = 'test_secret';
process.env.BCRYPT_SALT_ROUNDS = '10';

module.exports = {};
