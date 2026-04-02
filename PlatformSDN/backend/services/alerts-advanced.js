// PlatformSDN/backend/services/alerts-advanced.js - Advanced alerting system
const db = require('../db');
const cache = require('../cache');

// Alert severity levels
const SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO',
};

// Alert states
const STATE = {
  NEW: 'NEW',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED: 'RESOLVED',
  ESCALATED: 'ESCALATED',
};

class AlertService {
  // Create alert
  async createAlert(alertData) {
    try {
      const {
        title,
        description,
        severity,
        source,
        deviceId,
        metadata = {},
      } = alertData;

      const result = await db.query(
        `INSERT INTO alerts (title, description, severity, source, device_id, state, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [title, description, severity, source, deviceId, STATE.NEW, JSON.stringify(metadata)]
      );

      const alert = result.rows[0];

      // Invalidate cache
      cache.delete('alerts:all');
      cache.delete(`alerts:severity:${severity}`);

      // Auto-escalate critical alerts
      if (severity === SEVERITY.CRITICAL) {
        await this.escalateAlert(alert.id);
      }

      return alert;
    } catch (error) {
      console.error('[Alerts] Create error:', error.message);
      throw error;
    }
  }

  // Get alerts with filtering
  async getAlerts(filters = {}) {
    const cacheKey = `alerts:${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      let query = 'SELECT * FROM alerts WHERE 1=1';
      const params = [];

      if (filters.severity) {
        query += ` AND severity = $${params.length + 1}`;
        params.push(filters.severity);
      }

      if (filters.state) {
        query += ` AND state = $${params.length + 1}`;
        params.push(filters.state);
      }

      if (filters.deviceId) {
        query += ` AND device_id = $${params.length + 1}`;
        params.push(filters.deviceId);
      }

      if (filters.source) {
        query += ` AND source = $${params.length + 1}`;
        params.push(filters.source);
      }

      query += ' ORDER BY created_at DESC LIMIT 1000';

      const result = await db.query(query, params);
      const alerts = result.rows;

      cache.set(cacheKey, alerts, 60);
      return alerts;
    } catch (error) {
      console.error('[Alerts] Get alerts error:', error.message);
      throw error;
    }
  }

  // Get alert statistics
  async getAlertStats() {
    const cacheKey = 'alerts:stats';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await db.query(`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN state = 'NEW' THEN 1 END) as new_count,
          COUNT(CASE WHEN state = 'ACKNOWLEDGED' THEN 1 END) as acknowledged_count,
          COUNT(CASE WHEN state = 'RESOLVED' THEN 1 END) as resolved_count,
          COUNT(CASE WHEN severity = 'CRITICAL' THEN 1 END) as critical_count,
          COUNT(CASE WHEN severity = 'HIGH' THEN 1 END) as high_count,
          COUNT(CASE WHEN severity = 'MEDIUM' THEN 1 END) as medium_count,
          COUNT(CASE WHEN severity = 'LOW' THEN 1 END) as low_count
        FROM alerts
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `);

      const stats = result.rows[0];
      cache.set(cacheKey, stats, 300);
      return stats;
    } catch (error) {
      console.error('[Alerts] Get stats error:', error.message);
      throw error;
    }
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId, userId) {
    try {
      const result = await db.query(
        `UPDATE alerts Set state = $1, acknowledged_by = $2, acknowledged_at = NOW()
         WHERE id = $3 RETURNING *`,
        [STATE.ACKNOWLEDGED, userId, alertId]
      );

      cache.delete('alerts:stats');
      cache.clear('alerts:');

      return result.rows[0];
    } catch (error) {
      console.error('[Alerts] Acknowledge error:', error.message);
      throw error;
    }
  }

  // Resolve alert
  async resolveAlert(alertId, resolution) {
    try {
      const result = await db.query(
        `UPDATE alerts SET state = $1, resolution = $2, resolved_at = NOW()
         WHERE id = $3 RETURNING *`,
        [STATE.RESOLVED, resolution, alertId]
      );

      cache.delete('alerts:stats');
      cache.clear('alerts:');

      return result.rows[0];
    } catch (error) {
      console.error('[Alerts] Resolve error:', error.message);
      throw error;
    }
  }

  // Escalate alert
  async escalateAlert(alertId) {
    try {
      const result = await db.query(
        `UPDATE alerts SET state = $1, escalated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [STATE.ESCALATED, alertId]
      );

      // TODO: Send notifications (email, SMS, Slack, etc.)
      console.log('[Alerts] Escalated alert:', alertId);

      return result.rows[0];
    } catch (error) {
      console.error('[Alerts] Escalate error:', error.message);
      throw error;
    }
  }

  // Set up alert rules
  async createAlertRule(ruleData) {
    try {
      const { name, condition, severity, enabled = true } = ruleData;

      const result = await db.query(
        `INSERT INTO alert_rules (name, condition, severity, enabled, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [name, condition, severity, enabled]
      );

      cache.delete('alert_rules:all');
      return result.rows[0];
    } catch (error) {
      console.error('[Alerts] Create rule error:', error.message);
      throw error;
    }
  }

  // Get alert rules
  async getAlertRules() {
    const cacheKey = 'alert_rules:all';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await db.query('SELECT * FROM alert_rules WHERE enabled = true');
      const rules = result.rows;
      cache.set(cacheKey, rules, 600);
      return rules;
    } catch (error) {
      console.error('[Alerts] Get rules error:', error.message);
      throw error;
    }
  }
}

module.exports = new AlertService();
