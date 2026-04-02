// backend/services/auth.js - Authentication service
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');

async function hashPassword(password) {
  return bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    config.JWT.secret,
    { expiresIn: config.JWT.expiresIn }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, config.JWT.secret);
  } catch (error) {
    console.error('[Auth] Token verification failed:', error.message);
    return null;
  }
}

async function authenticate(username, password) {
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1 OR email = $1', [
      username,
    ]);

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    if (!user.is_active) {
      throw new Error('User account is inactive');
    }

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = generateToken(user);
    return { token, user: sanitizeUser(user) };
  } catch (error) {
    console.error('[Auth] Authentication error:', error.message);
    throw error;
  }
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    isActive: user.is_active,
    lastLogin: user.last_login,
    createdAt: user.created_at,
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  authenticate,
  sanitizeUser,
};
