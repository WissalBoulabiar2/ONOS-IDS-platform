// PlatformSDN/backend/controllers/auth-controller.js - Authentication controller
const authService = require('../services/auth');
const auditService = require('../services/audit-logs');

class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        await auditService.logAction({
          userId: null,
          action: 'LOGIN_ATTEMPT',
          resource: 'auth',
          resourceId: 'login',
          status: 'FAILED',
          details: { reason: 'missing_credentials' },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });

        return res.status(400).json({ error: 'Username and password required' });
      }

      const user = await authService.authenticate(username, password);

      if (!user) {
        await auditService.logAction({
          userId: null,
          action: 'LOGIN_ATTEMPT',
          resource: 'auth',
          resourceId: username,
          status: 'FAILED',
          details: { reason: 'invalid_credentials' },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });

        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = authService.generateToken(user);

      await auditService.logAction({
        userId: user.id,
        action: 'LOGIN',
        resource: 'auth',
        resourceId: 'login',
        status: 'SUCCESS',
        details: { username },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
        },
      });
    } catch (error) {
      console.error('[AuthController] Login error:', error.message);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async register(req, res) {
    try {
      const { username, email, password, fullName } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password required' });
      }

      // Check if user already exists
      const db = require('../db');
      const existing = await db.query('SELECT id FROM users WHERE username = $1 OR email = $2', [
        username,
        email,
      ]);

      if (existing.rows.length > 0) {
        await auditService.logAction({
          userId: null,
          action: 'REGISTER_ATTEMPT',
          resource: 'auth',
          resourceId: username,
          status: 'FAILED',
          details: { reason: 'user_exists' },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });

        return res.status(409).json({ error: 'User already exists' });
      }

      const passwordHash = await authService.hashPassword(password);
      const result = await db.query(
        `INSERT INTO users (username, email, password_hash, full_name, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
         RETURNING id, username, email, role, full_name`,
        [username, email, passwordHash, fullName || username, 'user']
      );

      const user = result.rows[0];
      const token = authService.generateToken(user);

      await auditService.logAction({
        userId: user.id,
        action: 'REGISTER',
        resource: 'auth',
        resourceId: username,
        status: 'SUCCESS',
        details: { email },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
        },
      });
    } catch (error) {
      console.error('[AuthController] Register error:', error.message);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async getCurrentUser(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      res.json({
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
          fullName: req.user.full_name,
        },
      });
    } catch (error) {
      console.error('[AuthController] Get current user error:', error.message);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  async logout(req, res) {
    try {
      await auditService.logAction({
        userId: req.user?.id,
        action: 'LOGOUT',
        resource: 'auth',
        resourceId: 'logout',
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('[AuthController] Logout error:', error.message);
      res.status(500).json({ error: 'Logout failed' });
    }
  }
}

module.exports = new AuthController();
