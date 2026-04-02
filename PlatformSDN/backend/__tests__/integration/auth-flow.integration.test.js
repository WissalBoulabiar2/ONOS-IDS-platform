const request = require('supertest');
const express = require('express');

const mockVerifyToken = jest.fn((token) =>
  token === 'valid-token'
    ? { id: 1, username: 'admin', role: 'admin', email: 'admin@sdn.local' }
    : null
);

jest.mock('../../services/auth', () => ({
  verifyToken: (...args) => mockVerifyToken(...args),
}));

jest.mock('../../controllers/auth-controller', () => ({
  login: jest.fn((_req, res) => res.json({ route: 'login' })),
  register: jest.fn((_req, res) => res.status(201).json({ route: 'register' })),
  getCurrentUser: jest.fn((req, res) => res.json({ user: req.user })),
  logout: jest.fn((_req, res) => res.json({ message: 'Logged out successfully' })),
}));

jest.mock('../../controllers/onos-controller', () => ({
  getDevices: jest.fn((_req, res) => res.json({ devices: [] })),
  getLinks: jest.fn((_req, res) => res.json({ links: [] })),
  getFlows: jest.fn((_req, res) => res.json({ flows: [] })),
  getIntents: jest.fn((_req, res) => res.json({ intents: [] })),
  getClusterTopology: jest.fn((_req, res) => res.json({ nodes: [], edges: [] })),
}));

jest.mock('../../controllers/users-controller', () => ({
  getAllUsers: jest.fn((_req, res) => res.json([])),
  getUserById: jest.fn((_req, res) => res.json({ id: 1 })),
  createUser: jest.fn((_req, res) => res.status(201).json({ id: 1 })),
  updateUser: jest.fn((_req, res) => res.json({ id: 1 })),
  deleteUser: jest.fn((_req, res) => res.json({ message: 'deleted' })),
}));

jest.mock('../../controllers/health-controller', () => ({
  getHealth: jest.fn((_req, res) => res.json({ status: 'healthy' })),
  getLiveness: jest.fn((_req, res) => res.json({ status: 'alive' })),
  getReadiness: jest.fn((_req, res) => res.json({ status: 'ready' })),
  getMetrics: jest.fn((_req, res) => res.json({ metrics: true })),
  getSystemMetrics: jest.fn((_req, res) => res.json({ system: true })),
}));

describe('Route Wiring Integration', () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    const router = require('../../routes/index');
    app = express();
    app.use(express.json());
    app.use('/api', router);
  });

  it('allows public health checks without authentication', async () => {
    const response = await request(app).get('/api/health').expect(200);

    expect(response.body.status).toBe('healthy');
    expect(mockVerifyToken).not.toHaveBeenCalled();
  });

  it('allows public login without authentication', async () => {
    const response = await request(app).post('/api/auth/login').send({}).expect(200);

    expect(response.body.route).toBe('login');
    expect(mockVerifyToken).not.toHaveBeenCalled();
  });

  it('allows public registration without authentication', async () => {
    const response = await request(app).post('/api/auth/register').send({}).expect(201);

    expect(response.body.route).toBe('register');
    expect(mockVerifyToken).not.toHaveBeenCalled();
  });

  it('rejects protected routes without a bearer token', async () => {
    const response = await request(app).get('/api/auth/me').expect(401);

    expect(response.body.error).toBe('No token provided');
  });

  it('rejects protected routes with an invalid bearer token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.error).toBe('Invalid or expired token');
  });

  it('allows protected routes with a valid bearer token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(response.body.user).toEqual(
      expect.objectContaining({
        id: 1,
        role: 'admin',
      })
    );
  });

  it('protects ONOS routes with the shared auth middleware', async () => {
    const response = await request(app)
      .get('/api/onos/devices')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(response.body.devices).toEqual([]);
  });

  it('allows authenticated logout and protected metrics routes', async () => {
    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    const metricsResponse = await request(app)
      .get('/api/metrics')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(logoutResponse.body.message).toBe('Logged out successfully');
    expect(metricsResponse.body.metrics).toBe(true);
  });

  it('allows authenticated user-management routes through the shared router', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(response.body).toEqual([]);
  });
});
