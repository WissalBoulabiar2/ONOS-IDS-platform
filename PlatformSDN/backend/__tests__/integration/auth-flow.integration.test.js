// PlatformSDN/backend/__tests__/integration/auth-flow.integration.test.js
const request = require('supertest');
const app = require('../../server-clean');
const db = require('../../db');
const authService = require('../../services/auth');

describe('Authentication Flow Integration Tests', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await db.initializePool();
  });

  afterAll(async () => {
    await db.closePool();
  });

  describe('Complete Auth Flow', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: `testuser_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          password: 'TestPassword123!',
          fullName: 'Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.username).toBeDefined();

      userId = response.body.user.id;
      token = response.body.token;
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.role).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username');
    });

    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/onos/devices')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/onos/devices')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });
});
