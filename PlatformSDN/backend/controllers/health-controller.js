// PlatformSDN/backend/controllers/health-controller.js - Health check and system status
const db = require('../db');
const metricsService = require('../services/metrics');

class HealthController {
  async getHealth(req, res) {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {},
        uptime: process.uptime(),
      };

      // Check database
      try {
        await db.query('SELECT 1');
        health.services.database = { status: 'healthy' };
      } catch (error) {
        health.services.database = { status: 'unhealthy', error: error.message };
        health.status = 'degraded';
      }

      // Get metrics
      health.metrics = metricsService.getSystemMetrics();

      res.json(health);
    } catch (error) {
      console.error('[HealthController] Health check error:', error.message);
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getLiveness(req, res) {
    // Simple liveness probe for Kubernetes
    try {
      res.json({ status: 'alive' });
    } catch (error) {
      res.status(503).json({ status: 'dead' });
    }
  }

  async getReadiness(req, res) {
    // Readiness probe - check if service can handle requests
    try {
      await db.query('SELECT 1');
      res.json({ status: 'ready' });
    } catch (error) {
      res.status(503).json({ status: 'not_ready', error: error.message });
    }
  }

  async getMetrics(req, res) {
    try {
      const metrics = metricsService.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('[HealthController] Get metrics error:', error.message);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  }

  async getSystemMetrics(req, res) {
    try {
      const metrics = metricsService.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('[HealthController] Get system metrics error:', error.message);
      res.status(500).json({ error: 'Failed to fetch system metrics' });
    }
  }
}

module.exports = new HealthController();
