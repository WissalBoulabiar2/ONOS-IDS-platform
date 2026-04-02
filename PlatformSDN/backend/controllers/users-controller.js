// PlatformSDN/backend/controllers/users-controller.js - User management controller
const db = require('../db');
const authService = require('../services/auth');
const auditService = require('../services/audit-logs');

class UsersController {
  async getAllUsers(req, res) {
    try {
      const result = await db.query(
        'SELECT id, username, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
      );

      await auditService.logAction({
        userId: req.user?.id,
        action: 'GET_USERS',
        resource: 'users',
        resourceId: 'all',
        status: 'SUCCESS',
        details: { count: result.rows.length },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json(result.rows);
    } catch (error) {
      console.error('[UsersController] Get all users error:', error.message);

      await auditService.logAction({
        userId: req.user?.id,
        action: 'GET_USERS',
        resource: 'users',
        resourceId: 'all',
        status: 'FAILED',
        details: { error: error.message },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'SELECT id, username, email, full_name, role, is_active, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      await auditService.logAction({
        userId: req.user?.id,
        action: 'GET_USER',
        resource: 'users',
        resourceId: id,
        status: 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[UsersController] Get user by ID error:', error.message);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  async createUser(req, res) {
    try {
      // Only admins can create users
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { username, email, password, fullName, role } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password required' });
      }

      const passwordHash = await authService.hashPassword(password);
      const result = await db.query(
        `INSERT INTO users (username, email, password_hash, full_name, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
         RETURNING id, username, email, full_name, role`,
        [username, email, passwordHash, fullName || username, role || 'user']
      );

      const user = result.rows[0];

      await auditService.logAction({
        userId: req.user?.id,
        action: 'CREATE_USER',
        resource: 'users',
        resourceId: user.id,
        status: 'SUCCESS',
        details: { username, email },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json(user);
    } catch (error) {
      console.error('[UsersController] Create user error:', error.message);

      await auditService.logAction({
        userId: req.user?.id,
        action: 'CREATE_USER',
        resource: 'users',
        resourceId: 'unknown',
        status: 'FAILED',
        details: { error: error.message },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { email, fullName, role, isActive } = req.body;

      // Users can only update themselves, unless admin
      if (req.user?.id !== parseInt(id) && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (email !== undefined) {
        updates.push(`email = $${paramCount++}`);
        values.push(email);
      }
      if (fullName !== undefined) {
        updates.push(`full_name = $${paramCount++}`);
        values.push(fullName);
      }
      if (role !== undefined && req.user?.role === 'admin') {
        updates.push(`role = $${paramCount++}`);
        values.push(role);
      }
      if (isActive !== undefined && req.user?.role === 'admin') {
        updates.push(`is_active = $${paramCount++}`);
        values.push(isActive);
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, full_name, role, is_active`;

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      await auditService.logAction({
        userId: req.user?.id,
        action: 'UPDATE_USER',
        resource: 'users',
        resourceId: id,
        status: 'SUCCESS',
        details: { email, fullName, role },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json(result.rows[0]);
    } catch (error) {
      console.error('[UsersController] Update user error:', error.message);

      await auditService.logAction({
        userId: req.user?.id,
        action: 'UPDATE_USER',
        resource: 'users',
        resourceId: req.params.id,
        status: 'FAILED',
        details: { error: error.message },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  async deleteUser(req, res) {
    try {
      // Only admins can delete users
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;

      const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id, username', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      await auditService.logAction({
        userId: req.user?.id,
        action: 'DELETE_USER',
        resource: 'users',
        resourceId: id,
        status: 'SUCCESS',
        details: { username: result.rows[0].username },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('[UsersController] Delete user error:', error.message);

      await auditService.logAction({
        userId: req.user?.id,
        action: 'DELETE_USER',
        resource: 'users',
        resourceId: req.params.id,
        status: 'FAILED',
        details: { error: error.message },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}

module.exports = new UsersController();
