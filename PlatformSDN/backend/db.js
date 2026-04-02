// backend/db.js - Database connection management
const { Pool } = require('pg');
const config = require('./config');

let pool = null;
let isDatabaseReady = false;
let lastDatabaseError = null;

function createPool() {
  return new Pool({
    user: config.DATABASE.user,
    password: config.DATABASE.password,
    host: config.DATABASE.host,
    port: config.DATABASE.port,
    database: config.DATABASE.database,
  });
}

function attachPoolErrorHandler(activePool) {
  if (typeof activePool?.on !== 'function') {
    return;
  }

  activePool.on('error', (error) => {
    isDatabaseReady = false;
    lastDatabaseError = error.message;
    console.error('[DB] Pool error:', error.message);
  });
}

async function initializePool() {
  try {
    pool = createPool();
    attachPoolErrorHandler(pool);

    // Test connection
    const conn = await pool.connect();
    conn.release();
    isDatabaseReady = true;
    console.log('[DB] Connection pool initialized successfully');
    return true;
  } catch (error) {
    isDatabaseReady = false;
    lastDatabaseError = error.message;
    console.error('[DB] Failed to initialize pool:', error.message);
    return false;
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializePool first.');
  }
  return pool;
}

async function query(sql, params = []) {
  const dbPool = getPool();
  try {
    const result = await dbPool.query(sql, params);
    return result;
  } catch (error) {
    console.error('[DB] Query error:', error.message);
    throw error;
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    isDatabaseReady = false;
    console.log('[DB] Connection pool closed');
  }
}

module.exports = {
  initializePool,
  getPool,
  query,
  closePool,
  isDatabaseReady: () => isDatabaseReady,
  getLastError: () => lastDatabaseError,
};
