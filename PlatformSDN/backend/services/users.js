// backend/services/users.js - User management service
const db = require('../db');
const auth = require('./auth');

async function getAllUsers() {
  try {
    const result = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows.map(auth.sanitizeUser);
  } catch (error) {
    console.error('[Users] Get all users error:', error.message);
    throw error;
  }
}

async function getUserById(id) {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    return auth.sanitizeUser(result.rows[0]);
  } catch (error) {
    console.error('[Users] Get user by ID error:', error.message);
    throw error;
  }
}

async function createUser(userData) {
  try {
    const { username, email, fullName, password, role = 'user' } = userData;
    const passwordHash = await auth.hashPassword(password);

    const result = await db.query(
      `INSERT INTO users (username, email, full_name, password_hash, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
       RETURNING *`,
      [username, email, fullName, passwordHash, role]
    );

    return auth.sanitizeUser(result.rows[0]);
  } catch (error) {
    console.error('[Users] Create user error:', error.message);
    throw error;
  }
}

async function updateUser(id, userData) {
  try {
    const { email, fullName, role, isActive } = userData;
    const result = await db.query(
      `UPDATE users
       SET email = COALESCE($1, email),
           full_name = COALESCE($2, full_name),
           role = COALESCE($3, role),
           is_active = COALESCE($4, is_active),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [email, fullName, role, isActive, id]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return auth.sanitizeUser(result.rows[0]);
  } catch (error) {
    console.error('[Users] Update user error:', error.message);
    throw error;
  }
}

async function deleteUser(id) {
  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return { success: true, id };
  } catch (error) {
    console.error('[Users] Delete user error:', error.message);
    throw error;
  }
}

async function changePassword(id, oldPassword, newPassword) {
  try {
    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const isValid = await auth.verifyPassword(oldPassword, result.rows[0].password_hash);
    if (!isValid) {
      throw new Error('Invalid current password');
    }

    const newHash = await auth.hashPassword(newPassword);
    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      newHash,
      id,
    ]);

    return { success: true };
  } catch (error) {
    console.error('[Users] Change password error:', error.message);
    throw error;
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
