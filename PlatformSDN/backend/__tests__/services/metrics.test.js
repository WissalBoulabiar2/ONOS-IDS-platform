// PlatformSDN/backend/__tests__/services/metrics.test.js
const metricsService = require('../../services/metrics');
const db = require('../../db');

jest.mock('../../db');
jest.mock('../../cache', () => ({
  getStats: jest.fn(() => ({ size: 100 })),
}));

describe('MetricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    metricsService.metrics.clear();
    metricsService.timeSeries = [];
  });

  describe('recordMetric', () => {
    it('should record a metric', () => {
      metricsService.recordMetric('test_metric', 100, { tag: 'value' });

      expect(metricsService.metrics.has('test_metric')).toBe(true);
      expect(metricsService.timeSeries.length).toBe(1);
    });

    it('should maintain time series with max 1000 entries', () => {
      for (let i = 0; i < 1100; i++) {
        metricsService.recordMetric(`metric_${i}`, i);
      }

      expect(metricsService.timeSeries.length).toBe(1000);
    });
  });

  describe('getSystemMetrics', () => {
    it('should return system metrics', () => {
      const metrics = metricsService.getSystemMetrics();

      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('cpu');
      expect(metrics).toHaveProperty('timestamp');
      expect(metrics.memory).toHaveProperty('heapUsed');
      expect(metrics.memory).toHaveProperty('heapTotal');
    });
  });

  describe('getAPIMetrics', () => {
    it('should return empty metrics if no API metrics recorded', () => {
      const metrics = metricsService.getAPIMetrics();

      expect(metrics.endpoints).toEqual({});
    });

    it('should calculate API metrics correctly', () => {
      metricsService.recordMetric('api_users', 100);
      metricsService.recordMetric('api_users', 200);
      metricsService.recordMetric('api_users', 150);

      const metrics = metricsService.getAPIMetrics();

      expect(metrics.endpoints.users).toBeDefined();
      expect(metrics.endpoints.users.count).toBe(3);
      expect(Math.round(metrics.endpoints.users.averageValue)).toBe(150);
      expect(metrics.endpoints.users.minValue).toBe(100);
      expect(metrics.endpoints.users.maxValue).toBe(200);
    });
  });

  describe('getDBMetrics', () => {
    it('should return database metrics', () => {
      metricsService.recordMetric('db_queries', 1);
      metricsService.recordMetric('db_query_time', 50);

      const metrics = metricsService.getDBMetrics();

      expect(metrics).toHaveProperty('queries');
      expect(metrics).toHaveProperty('connections');
      expect(metrics.queries.total).toBeGreaterThan(0);
    });
  });

  describe('getDashboardMetrics', () => {
    it('should return comprehensive dashboard metrics', () => {
      const metrics = metricsService.getDashboardMetrics();

      expect(metrics).toHaveProperty('system');
      expect(metrics).toHaveProperty('api');
      expect(metrics).toHaveProperty('database');
      expect(metrics).toHaveProperty('cache');
      expect(metrics).toHaveProperty('timestamp');
    });
  });

  describe('saveMetricsSnapshot', () => {
    it('should save metrics to database', async () => {
      db.query.mockResolvedValue({ rowCount: 1 });

      await metricsService.saveMetricsSnapshot();

      expect(db.query).toHaveBeenCalled();
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO metrics_snapshots'),
        expect.any(Array)
      );
    });
  });
});
