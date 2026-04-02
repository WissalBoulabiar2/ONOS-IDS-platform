// PlatformSDN/backend/services/query-optimizer.js - Query optimization utilities
const db = require('../db');

class QueryOptimizer {
  /**
   * Get users with pagination and filtering
   */
  static async getUsersList(page = 1, limit = 20, filters = {}) {
    let query = 'SELECT id, username, email, full_name, role, is_active, created_at FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.role) {
      query += ` AND role = $${paramCount++}`;
      params.push(filters.role);
    }

    if (filters.isActive !== undefined) {
      query += ` AND is_active = $${paramCount++}`;
      params.push(filters.isActive);
    }

    if (filters.search) {
      query += ` AND (username ILIKE $${paramCount++} OR email ILIKE $${paramCount++})`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // Sorting (default by created_at DESC)
    query += ' ORDER BY created_at DESC';

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get audit logs with pagination and filtering
   */
  static async getAuditLogsList(page = 1, limit = 50, filters = {}) {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.userId) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(filters.userId);
    }

    if (filters.action) {
      query += ` AND action = $${paramCount++}`;
      params.push(filters.action);
    }

    if (filters.status) {
      query += ` AND status = $${paramCount++}`;
      params.push(filters.status);
    }

    if (filters.startDate) {
      query += ` AND created_at >= $${paramCount++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ` AND created_at <= $${paramCount++}`;
      params.push(filters.endDate);
    }

    query += ' ORDER BY created_at DESC';

    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get alerts with pagination and filtering
   */
  static async getAlertsList(page = 1, limit = 50, filters = {}) {
    let query = 'SELECT * FROM alerts WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.severity) {
      query += ` AND severity = $${paramCount++}`;
      params.push(filters.severity);
    }

    if (filters.status) {
      query += ` AND status = $${paramCount++}`;
      params.push(filters.status);
    }

    if (filters.source) {
      query += ` AND source = $${paramCount++}`;
      params.push(filters.source);
    }

    query += ' ORDER BY triggered_at DESC';

    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Batch insert operations for performance
   */
  static async batchInsertMetrics(metrics) {
    if (!metrics || metrics.length === 0) return;

    const placeholders = metrics
      .map((_, i) => {
        const offset = i * 5;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
      })
      .join(',');

    const values = metrics.flatMap(m => [
      m.metric_type,
      m.metric_name,
      m.metric_value,
      m.tags ? JSON.stringify(m.tags) : null,
      new Date(),
    ]);

    const query = `INSERT INTO metrics_snapshots
      (metric_type, metric_name, metric_value, tags, created_at)
      VALUES ${placeholders}`;

    await db.query(query, values);
  }

  /**
   * Cleanup old cache entries
   */
  static async cleanupExpiredCache() {
    const queries = [
      'DELETE FROM api_request_cache WHERE expires_at < NOW()',
      'DELETE FROM device_cache WHERE ttl_expires_at < NOW()',
      'DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL \'90 days\'',
    ];

    for (const query of queries) {
      try {
        await db.query(query);
      } catch (error) {
        console.error('[QueryOptimizer] Cleanup error:', error.message);
      }
    }
  }

  /**
   * Get query performance stats
   */
  static async getQueryPerformanceStats() {
    const query = `
      SELECT
        query,
        calls,
        total_time,
        mean_time,
        max_time
      FROM pg_stat_statements
      WHERE query NOT LIKE '%pg_stat_statements%'
      ORDER BY mean_time DESC
      LIMIT 20;
    `;

    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('[QueryOptimizer] Performance stats error:', error.message);
      return [];
    }
  }

  /**
   * Analyze table for query optimization
   */
  static async analyzeTable(tableName) {
    await db.query(`ANALYZE ${tableName}`);
  }
}

module.exports = QueryOptimizer;
