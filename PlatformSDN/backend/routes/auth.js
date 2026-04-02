// backend/routes/auth.js - Authentication endpoints
const express = require('express');
const authService = require('../services/auth');
const usersService = require('../services/users');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const { token, user } = await authService.authenticate(username, password);
    res.json({ token, user });
  } catch (error) {
    next(error);
  }
});

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await usersService.createUser({
      username,
      email,
      fullName: fullName || username,
      password,
      role: 'user',
    });

    const token = authService.generateToken(user);
    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
});

// GET /auth/me - Get current user
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// POST /auth/change-password
router.post('/change-password', authMiddleware, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new password required' });
    }

    await usersService.changePassword(req.user.id, oldPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
