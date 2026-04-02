// PlatformSDN/backend/services/metrics.js - Advanced metrics collection
const cache = require('../cache');
const db = require('../db');

class MetricsService {
  constructor() {
    this.metrics = new Map();
    this.timeSeries = [];
    this.startTime = Date.now();
  }

  // Record metric
  recordMetric(name, value, tags = {}) {
    const metric = {
      name,
      value,
      tags,
      timestamp: Date.now(),
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name).push(metric);
    this.timeSeries.push(metric);

    // Keep only last 1000 metrics
    if (this.timeSeries.length > 1000) {
      this.timeSeries.shift();
    }
  }

  // Get system metrics
  getSystemMetrics() {
    const uptime = Date.now() - this.startTime;
    const memUsage = process.memoryUsage();

    return {
      uptime: Math.floor(uptime / 1000), // seconds
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
      },
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString(),
    };
  }

  // Get API metrics
  getAPIMetrics() {
    const metrics = {
      requests: {
        total: 0,
        success: 0,
        failed: 0,
        averageResponseTime: 0,
      },
      endpoints: {},
    };

    for (const [metricName, values] of this.metrics) {
      if (metricName.startsWith('api_')) {
        const endpoint = metricName.replace('api_', '');
        metrics.endpoints[endpoint] = {
          count: values.length,
          averageValue: (values.reduce((sum, m) => sum + m.value, 0) / values.length).toFixed(2),
          minValue: Math.min(...values.map((m) => m.value)),
          maxValue: Math.max(...values.map((m) => m.value)),
        };
      }
    }

    return metrics;
  }

  // Get database metrics
  getDBMetrics() {
    return {
      queries: {
        total: this.metrics.get('db_queries')?.length || 0,
        avgTime:
          this.metrics.get('db_query_time')?.reduce((sum, m) => sum + m.value, 0) /
            (this.metrics.get('db_query_time')?.length || 1) || 0,
      },
      connections: {
        active: 0,
        idle: 0,
        waiting: 0,
      },
    };
  }

  // Get cache metrics
  getCacheMetrics() {
    return {
      hits: this.metrics.get('cache_hit')?.length || 0,
      misses: this.metrics.get('cache_miss')?.length || 0,
      hitRatio: this.calculateHitRatio(),
      size: cache.getStats().size,
    };
  }

  calculateHitRatio() {
    const hits = this.metrics.get('cache_hit')?.length || 0;
    const misses = this.metrics.get('cache_miss')?.length || 0;
    const total = hits + misses;

    if (total === 0) return 0;
    return ((hits / total) * 100).toFixed(2);
  }

  // Get comprehensive dashboard data
  getDashboardMetrics() {
    return {
      system: this.getSystemMetrics(),
      api: this.getAPIMetrics(),
      database: this.getDBMetrics(),
      cache: this.getCacheMetrics(),
      timestamp: new Date().toISOString(),
    };
  }

  // Save metrics to database for historical tracking
  async saveMetricsSnapshot() {
    try {
      const snapshot = this.getDashboardMetrics();

      await db.query(
        `INSERT INTO metrics_snapshots (system_metrics, api_metrics, db_metrics, cache_metrics, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [
          JSON.stringify(snapshot.system),
          JSON.stringify(snapshot.api),
          JSON.stringify(snapshot.database),
          JSON.stringify(snapshot.cache),
        ]
      );

      // Keep only last 10,000 snapshots (approximately 7 days at 1 per minute)
      await db.query(`DELETE FROM metrics_snapshots
         WHERE id NOT IN (SELECT id FROM metrics_snapshots ORDER BY created_at DESC LIMIT 10000)`);
    } catch (error) {
      console.error('[Metrics] Save snapshot error:', error.message);
    }
  }

  // Get metrics trend
  async getMetricsTrend(hours = 24) {
    try {
      const result = await db.query(
        `SELECT
           created_at,
           system_metrics->>'heapUsed' as heap_used,
           api_metrics->'requests'->>'averageResponseTime' as avg_response_time,
           cache_metrics->>'hitRatio' as cache_hit_ratio
         FROM metrics_snapshots
         WHERE created_at > NOW() - INTERVAL '${hours} hours'
         ORDER BY created_at ASC`
      );

      return result.rows;
    } catch (error) {
      console.error('[Metrics] Get trend error:', error.message);
      return [];
    }
  }
}

module.exports = new MetricsService();
