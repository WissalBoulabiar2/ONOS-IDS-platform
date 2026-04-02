// PlatformSDN/backend/__tests__/routes/auth.test.js
const request = require('supertest');
const express = require('express');

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock route for testing
    app.post('/login', (req, res) => {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      if (username === 'admin' && password === 'admin123') {
        return res.json({
          token: 'mock.jwt.token',
          user: { id: 1, username: 'admin', role: 'admin' },
        });
      }

      res.status(401).json({ error: 'Invalid credentials' });
    });
  });

  describe('POST /login', () => {
    test('should require username and password', async () => {
      const response = await request(app).post('/login').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password required');
    });

    test('should return token on successful login', async () => {
      const response = await request(app)
        .post('/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('admin');
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({ username: 'admin', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});
