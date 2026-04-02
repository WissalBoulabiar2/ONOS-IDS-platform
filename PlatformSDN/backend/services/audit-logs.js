// PlatformSDN/backend/services/audit-logs.js - Comprehensive audit logging
const db = require('../db');
const cache = require('../cache');

class AuditService {
  // Log user action
  async logAction(actionData) {
    try {
      const {
        userId,
        action,
        resource,
        resourceId,
        status,
        details = {},
        ipAddress,
        userAgent,
      } = actionData;

      const result = await db.query(
        `INSERT INTO audit_logs (user_id, action, resource, resource_id, status, details, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         RETURNING *`,
        [userId, action, resource, resourceId, status, JSON.stringify(details), ipAddress, userAgent]
      );

      console.log(`[Audit] ${action} on ${resource}/${resourceId} by user ${userId}`);
      cache.delete('audit:logs');

      return result.rows[0];
    } catch (error) {
      console.error('[Audit] Log error:', error.message);
      throw error;
    }
  }

  // Get audit logs with filtering
  async getAuditLogs(filters = {}) {
    const cacheKey = `audit:logs:${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      let query =
        'SELECT id, user_id, action, resource, status, created_at FROM audit_logs WHERE 1=1';
      const params = [];

      if (filters.userId) {
        query += ` AND user_id = $${params.length + 1}`;
        params.push(filters.userId);
      }

      if (filters.action) {
        query += ` AND action = $${params.length + 1}`;
        params.push(filters.action);
      }

      if (filters.resource) {
        query += ` AND resource = $${params.length + 1}`;
        params.push(filters.resource);
      }

      if (filters.status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(filters.status);
      }

      if (filters.startDate) {
        query += ` AND created_at >= $${params.length + 1}`;
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ` AND created_at <= $${params.length + 1}`;
        params.push(filters.endDate);
      }

      query += ' ORDER BY created_at DESC LIMIT 10000';

      const result = await db.query(query, params);
      const logs = result.rows;

      cache.set(cacheKey, logs, 300);
      return logs;
    } catch (error) {
      console.error('[Audit] Get logs error:', error.message);
      throw error;
    }
  }

  // Get suspicious activities
  async getSuspiciousActivities() {
    try {
      const result = await db.query(`
        SELECT
          user_id,
          COUNT(*) as failed_attempts,
          array_agg(DISTINCT ip_address) as ips,
          MAX(created_at) as last_attempt
        FROM audit_logs
        WHERE status = 'FAILED'
          AND created_at > NOW() - INTERVAL '1 hour'
        GROUP BY user_id
        HAVING COUNT(*) > 5
        ORDER BY failed_attempts DESC
      `);

      return result.rows;
    } catch (error) {
      console.error('[Audit] Get suspicious activities error:', error.message);
      throw error;
    }
  }

  // Generate audit report
  async generateAuditReport(startDate, endDate) {
    try {
      const result = await db.query(
        `SELECT
           action,
           COUNT(*) as count,
           COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as successful,
           COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
         FROM audit_logs
         WHERE created_at BETWEEN $1 AND $2
         GROUP BY action
         ORDER BY count DESC`,
        [startDate, endDate]
      );

      return result.rows;
    } catch (error) {
      console.error('[Audit] Generate report error:', error.message);
      throw error;
    }
  }

  // Archive old logs
  async archiveOldLogs(daysOld = 90) {
    try {
      const result = await db.query(
        `DELETE FROM audit_logs
         WHERE created_at < NOW() - INTERVAL '${daysOld} days'
         RETURNING id`,
      );

      console.log('[Audit] Archived', result.rowCount, 'old logs');
      cache.delete('audit:logs');

      return { archivedCount: result.rowCount };
    } catch (error) {
      console.error('[Audit] Archive error:', error.message);
      throw error;
    }
  }
}

module.exports = new AuditService();
