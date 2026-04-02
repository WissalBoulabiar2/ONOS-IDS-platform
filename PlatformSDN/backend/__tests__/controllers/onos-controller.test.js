// PlatformSDN/backend/__tests__/controllers/onos-controller.test.js
const onosController = require('../../controllers/onos-controller');
const onosService = require('../../services/onos');
const metricsService = require('../../services/metrics');
const auditService = require('../../services/audit-logs');

jest.mock('../../services/onos');
jest.mock('../../services/metrics');
jest.mock('../../services/audit-logs');

describe('OnosController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      user: { id: 1 },
      ip: '127.0.0.1',
      get: jest.fn(() => 'Mozilla/5.0'),
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('getDevices', () => {
    it('should return devices from ONOS', async () => {
      const devices = { devices: [{ id: 'device1' }, { id: 'device2' }] };
      onosService.getDevices.mockResolvedValue(devices);

      await onosController.getDevices(req, res);

      expect(res.json).toHaveBeenCalledWith(devices);
      expect(auditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'GET_DEVICES',
          status: 'SUCCESS',
        })
      );
      expect(metricsService.recordMetric).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('ONOS unavailable');
      onosService.getDevices.mockRejectedValue(error);

      await onosController.getDevices(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(auditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'GET_DEVICES',
          status: 'FAILED',
        })
      );
    });
  });

  describe('getLinks', () => {
    it('should return links from ONOS', async () => {
      const links = { links: [{ src: 'device1', dst: 'device2' }] };
      onosService.getLinks.mockResolvedValue(links);

      await onosController.getLinks(req, res);

      expect(res.json).toHaveBeenCalledWith(links);
    });
  });

  describe('getFlows', () => {
    it('should return flows', async () => {
      const flows = { flows: [{ id: 'flow1' }] };
      req.query.deviceId = 'device1';
      onosService.getFlows.mockResolvedValue(flows);

      await onosController.getFlows(req, res);

      expect(res.json).toHaveBeenCalledWith(flows);
    });
  });

  describe('getIntents', () => {
    it('should return intents', async () => {
      const intents = { intents: [{ id: 'intent1' }] };
      onosService.getIntents.mockResolvedValue(intents);

      await onosController.getIntents(req, res);

      expect(res.json).toHaveBeenCalledWith(intents);
    });
  });
});
