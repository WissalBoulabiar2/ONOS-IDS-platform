// PlatformSDN/backend/db-optimized.js - Database query optimization utilities
const db = require('./db');

class QueryBuilder {
  constructor() {
    this.query = '';
    this.params = [];
    this.paramIndex = 0;
  }

  addParam(value) {
    this.paramIndex++;
    this.params.push(value);
    return `$${this.paramIndex}`;
  }

  select(...columns) {
    this.query += `SELECT ${columns.join(', ')} FROM users`;
    return this;
  }

  where(condition) {
    if (!this.query.includes('WHERE')) {
      this.query += ' WHERE ';
    } else {
      this.query += ' AND ';
    }
    this.query += condition;
    return this;
  }

  andWhere(condition) {
    return this.where(condition);
  }

  limit(count) {
    this.query += ` LIMIT ${count}`;
    return this;
  }

  offset(count) {
    this.query += ` OFFSET ${count}`;
    return this;
  }

  orderBy(column, direction = 'ASC') {
    this.query += ` ORDER BY ${column} ${direction}`;
    return this;
  }

  async execute() {
    console.log('[DB Query]', this.query);
    return db.query(this.query, this.params);
  }
}

// Prepared statement helpers
const preparedStatements = {
  getUserById: 'SELECT * FROM users WHERE id = $1',
  getAllUsers: 'SELECT * FROM users ORDER BY created_at DESC',
  getUserByEmail: 'SELECT * FROM users WHERE email = $1',
  getUserByUsername: 'SELECT * FROM users WHERE username = $1',
  createUser: `INSERT INTO users (username, email, full_name, password_hash, role, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW()) RETURNING *`,
  updateUser: `UPDATE users SET email = $1, full_name = $2, role = $3, is_active = $4, updated_at = NOW()
               WHERE id = $5 RETURNING *`,
  deleteUser: 'DELETE FROM users WHERE id = $1 RETURNING id',
};

async function getQueryStats() {
  try {
    const result = await db.query(`
      SELECT
        query,
        calls,
        total_time,
        (total_time / calls)::numeric(10,2) as avg_time
      FROM pg_stat_statements
      ORDER BY total_time DESC
      LIMIT 10
    `);

    return result.rows || [];
  } catch (error) {
    console.warn('[DB Stats] pg_stat_statements not available:', error.message);
    return [];
  }
}

// Connection pool monitoring
async function getPoolStats() {
  try {
    const pool = db.getPool();
    return {
      totalCount: pool.totalCount || 0,
      idleCount: pool.idleCount || 0,
      waitingCount: pool.waitingCount || 0,
    };
  } catch (error) {
    return null;
  }
}

module.exports = {
  QueryBuilder,
  preparedStatements,
  getQueryStats,
  getPoolStats,
};
