// PlatformSDN/backend/__tests__/utils/test-helpers.js - Test helper utilities
/**
 * Create a mock request object
 */
function createMockRequest(overrides = {}) {
  return {
    body: {},
    params: {},
    query: {},
    path: '/api/test',
    originalUrl: '/api/test',
    method: 'GET',
    headers: {},
    user: null,
    connection: { remoteAddress: '127.0.0.1' },
    ip: '127.0.0.1',
    get: jest.fn(() => 'Mozilla/5.0'),
    ...overrides,
  };
}

/**
 * Create a mock response object
 */
function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
  return res;
}

/**
 * Create a mock authenticated request
 */
function createMockAuthenticatedRequest(user = {}, overrides = {}) {
  return createMockRequest({
    user: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      ...user,
    },
    ...overrides,
  });
}

/**
 * Create a mock admin request
 */
function createMockAdminRequest(user = {}, overrides = {}) {
  return createMockAuthenticatedRequest(
    {
      role: 'admin',
      ...user,
    },
    overrides
  );
}

module.exports = {
  createMockRequest,
  createMockResponse,
  createMockAuthenticatedRequest,
  createMockAdminRequest,
};
