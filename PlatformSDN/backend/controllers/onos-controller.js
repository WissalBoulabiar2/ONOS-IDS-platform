// PlatformSDN/backend/controllers/onos-controller.js - ONOS API controller
const onosService = require('../services/onos');
const metricsService = require('../services/metrics');
const auditService = require('../services/audit-logs');

class OnosController {
  async getDevices(req, res) {
    try {
      const startTime = Date.now();
      const devices = await onosService.getDevices();
      const responseTime = Date.now() - startTime;

      metricsService.recordMetric('api_devices', responseTime, { endpoint: '/onos/devices' });

      await auditService.logAction({
        userId: req.user?.id,
        action: 'GET_DEVICES',
        resource: 'onos',
        resourceId: 'devices',
        status: 'SUCCESS',
        details: { count: devices.devices?.length || 0 },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json(devices);
    } catch (error) {
      console.error('[OnosController] Get devices error:', error.message);

      await auditService.logAction({
        userId: req.user?.id,
        action: 'GET_DEVICES',
        resource: 'onos',
        resourceId: 'devices',
        status: 'FAILED',
        details: { error: error.message },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(500).json({ error: 'Failed to fetch devices' });
    }
  }

  async getLinks(req, res) {
    try {
      const startTime = Date.now();
      const links = await onosService.getLinks();
      const responseTime = Date.now() - startTime;

      metricsService.recordMetric('api_links', responseTime, { endpoint: '/onos/links' });

      await auditService.logAction({
        userId: req.user?.id,
        action: 'GET_LINKS',
        resource: 'onos',
        resourceId: 'links',
        status: 'SUCCESS',
        details: { count: links.links?.length || 0 },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json(links);
    } catch (error) {
      console.error('[OnosController] Get links error:', error.message);

      await auditService.logAction({
        userId: req.user?.id,
        action: 'GET_LINKS',
        resource: 'onos',
        resourceId: 'links',
        status: 'FAILED',
        details: { error: error.message },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(500).json({ error: 'Failed to fetch links' });
    }
  }

  async getFlows(req, res) {
    try {
      const { deviceId } = req.query;
      const startTime = Date.now();
      const flows = await onosService.getFlows(deviceId);
      const responseTime = Date.now() - startTime;

      metricsService.recordMetric('api_flows', responseTime, { endpoint: '/onos/flows' });

      await auditService.logAction({
        userId: req.user?.id,
        action: 'GET_FLOWS',
        resource: 'onos',
        resourceId: deviceId || 'all',
        status: 'SUCCESS',
        details: { count: flows.flows?.length || 0, deviceId },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json(flows);
    } catch (error) {
      console.error('[OnosController] Get flows error:', error.message);

      await auditService.logAction({
        userId: req.user?.id,
        action: 'GET_FLOWS',
        resource: 'onos',
        resourceId: req.query.deviceId || 'all',
        status: 'FAILED',
        details: { error: error.message },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(500).json({ error: 'Failed to fetch flows' });
    }
  }

  async getIntents(req, res) {
    try {
      const startTime = Date.now();
      const intents = await onosService.getIntents();
      const responseTime = Date.now() - startTime;

      metricsService.recordMetric('api_intents', responseTime, { endpoint: '/onos/intents' });

      await auditService.logAction({
        userId: req.user?.id,
        action: 'GET_INTENTS',
        resource: 'onos',
        resourceId: 'intents',
        status: 'SUCCESS',
        details: { count: intents.intents?.length || 0 },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json(intents);
    } catch (error) {
      console.error('[OnosController] Get intents error:', error.message);

      await auditService.logAction({
        userId: req.user?.id,
        action: 'GET_INTENTS',
        resource: 'onos',
        resourceId: 'intents',
        status: 'FAILED',
        details: { error: error.message },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(500).json({ error: 'Failed to fetch intents' });
    }
  }

  async getClusterTopology(req, res) {
    try {
      const topology = await onosService.getClusterTopology();
      res.json(topology);
    } catch (error) {
      console.error('[OnosController] Get cluster topology error:', error.message);
      res.status(500).json({ error: 'Failed to fetch cluster topology' });
    }
  }
}

module.exports = new OnosController();
