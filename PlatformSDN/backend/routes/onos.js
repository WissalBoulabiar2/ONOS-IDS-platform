// backend/routes/onos.js - ONOS API endpoints
const express = require('express');
const onosService = require('../services/onos');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All ONOS routes require authentication
router.use(authMiddleware);

// GET /onos/devices
router.get('/devices', async (req, res, next) => {
  try {
    const devices = await onosService.getDevices();
    res.json({ devices });
  } catch (error) {
    next(error);
  }
});

// GET /onos/links
router.get('/links', async (req, res, next) => {
  try {
    const links = await onosService.getLinks();
    res.json({ links });
  } catch (error) {
    next(error);
  }
});

// GET /onos/flows
router.get('/flows', async (req, res, next) => {
  try {
    const flows = await onosService.getFlows();
    res.json({ flows });
  } catch (error) {
    next(error);
  }
});

// GET /onos/intents
router.get('/intents', async (req, res, next) => {
  try {
    const intents = await onosService.getIntents();
    res.json({ intents });
  } catch (error) {
    next(error);
  }
});

// GET /onos/topology
router.get('/topology', async (req, res, next) => {
  try {
    const topology = await onosService.getClusterTopology();
    res.json(topology);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
