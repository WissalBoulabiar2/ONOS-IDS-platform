const healthController = require('../../controllers/health-controller');
const db = require('../../db');
const metricsService = require('../../services/metrics');

jest.mock('../../db');
jest.mock('../../services/metrics');

describe('HealthController', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('returns a healthy payload when database and metrics are available', async () => {
    db.query.mockResolvedValue({ rows: [{ '?column?': 1 }] });
    metricsService.getSystemMetrics.mockReturnValue({ cpu: 42 });

    await healthController.getHealth(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'healthy',
        services: {
          database: { status: 'healthy' },
        },
        metrics: { cpu: 42 },
      })
    );
  });

  it('returns a degraded payload when the database check fails', async () => {
    db.query.mockRejectedValue(new Error('db down'));
    metricsService.getSystemMetrics.mockReturnValue({ cpu: 42 });

    await healthController.getHealth(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'degraded',
        services: {
          database: expect.objectContaining({
            status: 'unhealthy',
            error: 'db down',
          }),
        },
      })
    );
  });

  it('returns readiness and liveness payloads', async () => {
    db.query.mockResolvedValue({ rows: [{ '?column?': 1 }] });

    await healthController.getLiveness(req, res);
    await healthController.getReadiness(req, res);

    expect(res.json).toHaveBeenCalledWith({ status: 'alive' });
    expect(res.json).toHaveBeenCalledWith({ status: 'ready' });
  });

  it('returns controller metrics payloads', async () => {
    metricsService.getDashboardMetrics.mockReturnValue({ dashboard: true });
    metricsService.getSystemMetrics.mockReturnValue({ system: true });

    await healthController.getMetrics(req, res);
    await healthController.getSystemMetrics(req, res);

    expect(res.json).toHaveBeenCalledWith({ dashboard: true });
    expect(res.json).toHaveBeenCalledWith({ system: true });
  });
});
