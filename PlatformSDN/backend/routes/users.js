// backend/routes/users.js - User management endpoints
const express = require('express');
const usersService = require('../services/users');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// GET /users - Get all users
router.get('/', async (req, res, next) => {
  try {
    const users = await usersService.getAllUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// GET /users/:id - Get user by ID
router.get('/:id', async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// POST /users - Create new user
router.post('/', async (req, res, next) => {
  try {
    const { username, email, fullName, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await usersService.createUser({
      username,
      email,
      fullName,
      password,
      role: role || 'user',
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// PATCH /users/:id - Update user
router.patch('/:id', async (req, res, next) => {
  try {
    const { email, fullName, role, isActive } = req.body;
    const user = await usersService.updateUser(req.params.id, {
      email,
      fullName,
      role,
      isActive,
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// DELETE /users/:id - Delete user
router.delete('/:id', async (req, res, next) => {
  try {
    // Prevent self-deletion
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await usersService.deleteUser(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
