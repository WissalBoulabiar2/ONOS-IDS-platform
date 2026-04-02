// PlatformSDN/backend/services/tenants.js - Multi-tenancy support
const db = require('../db');
const cache = require('../cache');

class TenantService {
  // Create tenant
  async createTenant(tenantData) {
    try {
      const { name, domain, adminEmail, plan = 'basic' } = tenantData;

      const result = await db.query(
        `INSERT INTO tenants (name, domain, admin_email, plan, is_active, created_at)
         VALUES ($1, $2, $3, $4, true, NOW())
         RETURNING *`,
        [name, domain, adminEmail, plan]
      );

      cache.delete('tenants:all');
      return result.rows[0];
    } catch (error) {
      console.error('[Tenants] Create error:', error.message);
      throw error;
    }
  }

  // Get tenant by ID
  async getTenantById(tenantId) {
    const cacheKey = `tenant:${tenantId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await db.query('SELECT * FROM tenants WHERE id = $1', [tenantId]);

      if (result.rows.length === 0) {
        throw new Error('Tenant not found');
      }

      const tenant = result.rows[0];
      cache.set(cacheKey, tenant, 600);
      return tenant;
    } catch (error) {
      console.error('[Tenants] Get by ID error:', error.message);
      throw error;
    }
  }

  // Get tenant by domain
  async getTenantByDomain(domain) {
    const cacheKey = `tenant:domain:${domain}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await db.query('SELECT * FROM tenants WHERE domain = $1', [domain]);

      if (result.rows.length === 0) {
        throw new Error('Tenant not found');
      }

      const tenant = result.rows[0];
      cache.set(cacheKey, tenant, 600);
      return tenant;
    } catch (error) {
      console.error('[Tenants] Get by domain error:', error.message);
      throw error;
    }
  }

  // Get all tenants
  async getAllTenants() {
    const cacheKey = 'tenants:all';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await db.query('SELECT * FROM tenants WHERE is_active = true ORDER BY created_at DESC');
      cache.set(cacheKey, result.rows, 600);
      return result.rows;
    } catch (error) {
      console.error('[Tenants] Get all error:', error.message);
      throw error;
    }
  }

  // Update tenant
  async updateTenant(tenantId, updateData) {
    try {
      const { name, adminEmail, plan, isActive } = updateData;

      const result = await db.query(
        `UPDATE tenants
         SET name = COALESCE($1, name),
             admin_email = COALESCE($2, admin_email),
             plan = COALESCE($3, plan),
             is_active = COALESCE($4, is_active),
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [name, adminEmail, plan, isActive, tenantId]
      );

      if (result.rows.length === 0) {
        throw new Error('Tenant not found');
      }

      cache.delete(`tenant:${tenantId}`);
      cache.delete('tenants:all');

      return result.rows[0];
    } catch (error) {
      console.error('[Tenants] Update error:', error.message);
      throw error;
    }
  }

  // Get tenant users
  async getTenantUsers(tenantId) {
    const cacheKey = `tenant:users:${tenantId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await db.query(
        'SELECT * FROM users WHERE tenant_id = $1 ORDER BY created_at DESC',
        [tenantId]
      );

      cache.set(cacheKey, result.rows, 300);
      return result.rows;
    } catch (error) {
      console.error('[Tenants] Get users error:', error.message);
      throw error;
    }
  }

  // Get tenant ONOS configuration
  async getTenantONOSConfig(tenantId) {
    const cacheKey = `tenant:onos:${tenantId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await db.query(
        'SELECT * FROM tenant_onos_config WHERE tenant_id = $1',
        [tenantId]
      );

      if (result.rows.length === 0) {
        throw new Error('ONOS configuration not found for tenant');
      }

      const config = result.rows[0];
      cache.set(cacheKey, config, 600);
      return config;
    } catch (error) {
      console.error('[Tenants] Get ONOS config error:', error.message);
      throw error;
    }
  }

  // Set tenant ONOS configuration
  async setTenantONOSConfig(tenantId, onosConfig) {
    try {
      const { host, port, username, password } = onosConfig;

      const result = await db.query(
        `INSERT INTO tenant_onos_config (tenant_id, host, port, username, password, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (tenant_id) DO UPDATE SET
           host = $2, port = $3, username = $4, password = $5, updated_at = NOW()
         RETURNING *`,
        [tenantId, host, port, username, password]
      );

      cache.delete(`tenant:onos:${tenantId}`);
      return result.rows[0];
    } catch (error) {
      console.error('[Tenants] Set ONOS config error:', error.message);
      throw error;
    }
  }

  // Get tenant usage statistics
  async getTenantUsageStats(tenantId) {
    try {
      const result = await db.query(
        `SELECT
           t.id,
           t.name,
           t.plan,
           COUNT(DISTINCT u.id) as user_count,
           COUNT(DISTINCT CASE WHEN a.severity = 'CRITICAL' THEN a.id END) as critical_alerts,
           COUNT(DISTINCT CASE WHEN a.severity = 'HIGH' THEN a.id END) as high_alerts
         FROM tenants t
         LEFT JOIN users u ON t.id = u.tenant_id
         LEFT JOIN alerts a ON t.id = a.tenant_id AND a.created_at > NOW() - INTERVAL '24 hours'
         WHERE t.id = $1
         GROUP BY t.id, t.name, t.plan`,
        [tenantId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('[Tenants] Get usage stats error:', error.message);
      throw error;
    }
  }
}

module.exports = new TenantService();
