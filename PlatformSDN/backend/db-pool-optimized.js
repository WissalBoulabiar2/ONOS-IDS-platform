// PlatformSDN/backend/db-pool-optimized.js - Optimized database connection pooling
const { Pool } = require('pg');

class OptimizedPool {
  constructor() {
    this.pool = null;
    this.stats = {
      totalQueries: 0,
      totalErrors: 0,
      slowQueries: [],
    };
    this.slowQueryThreshold = 1000; // ms
  }

  async initialize() {
    this.pool = new Pool({
      user: process.env.DB_USER || 'sdnuser',
      password: process.env.DB_PASSWORD || 'sdnpass123',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'sdn_platform',
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
      application_name: 'sdn_platform',
      allowExitOnIdle: false,
    });

    this.pool.on('error', (err) => {
      console.error('[DB Pool] Error event:', err.message);
      this.stats.totalErrors++;
    });

    // Test connection
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('[DB Pool] Connection successful');
      return true;
    } catch (error) {
      console.error('[DB Pool] Connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Execute query with performance tracking
   */
  async query(sql, params = []) {
    const startTime = Date.now();
    this.stats.totalQueries++;

    try {
      const result = await this.pool.query(sql, params);
      const duration = Date.now() - startTime;

      if (duration > this.slowQueryThreshold) {
        this.stats.slowQueries.push({
          sql: sql.substring(0, 100),
          duration,
          timestamp: new Date(),
        });

        if (this.stats.slowQueries.length > 100) {
          this.stats.slowQueries = this.stats.slowQueries.slice(-100);
        }

        console.warn(`[DB] Slow query (${duration}ms): ${sql.substring(0, 50)}...`);
      }

      return result;
    } catch (error) {
      this.stats.totalErrors++;
      console.error('[DB] Query error:', error.message);
      throw error;
    }
  }

  /**
   * Batch queries for performance
   */
  async batchQuery(queries) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const results = [];
      for (const { sql, params } of queries) {
        const result = await client.query(sql, params);
        results.push(result);
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get pool statistics
   */
  getPoolStats() {
    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingRequests: this.pool.waitingCount,
      queries: this.stats.totalQueries,
      errors: this.stats.totalErrors,
      slowQueries: this.stats.slowQueries.length,
    };
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    return {
      stats: this.getPoolStats(),
      recentSlowQueries: this.stats.slowQueries.slice(-10),
      avgErrorRate:
        this.stats.totalQueries > 0
          ? ((this.stats.totalErrors / this.stats.totalQueries) * 100).toFixed(2) + '%'
          : '0%',
    };
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('[DB Pool] Connection pool closed');
    }
  }
}

module.exports = new OptimizedPool();
