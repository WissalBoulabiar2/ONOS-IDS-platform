// PlatformSDN/backend/routes/index.js - Clean route setup
const express = require('express');
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/auth-controller');
const onosController = require('../controllers/onos-controller');
const usersController = require('../controllers/users-controller');
const healthController = require('../controllers/health-controller');

const router = express.Router();

// Health checks - no auth required
router.get('/health', healthController.getHealth.bind(healthController));
router.get('/live', healthController.getLiveness.bind(healthController));
router.get('/ready', healthController.getReadiness.bind(healthController));

// Auth routes - no auth required for login/register
router.post('/auth/login', authController.login.bind(authController));
router.post('/auth/register', authController.register.bind(authController));

// Auth-protected routes
router.use(authMiddleware);

router.get('/auth/me', authController.getCurrentUser.bind(authController));
router.post('/auth/logout', authController.logout.bind(authController));

// ONOS routes - protected
router.get('/onos/devices', onosController.getDevices.bind(onosController));
router.get('/onos/links', onosController.getLinks.bind(onosController));
router.get('/onos/flows', onosController.getFlows.bind(onosController));
router.get('/onos/intents', onosController.getIntents.bind(onosController));
router.get('/onos/topology', onosController.getClusterTopology.bind(onosController));

// Users routes - protected
router.get('/users', usersController.getAllUsers.bind(usersController));
router.get('/users/:id', usersController.getUserById.bind(usersController));
router.post('/users', usersController.createUser.bind(usersController));
router.put('/users/:id', usersController.updateUser.bind(usersController));
router.delete('/users/:id', usersController.deleteUser.bind(usersController));

// Metrics routes - protected
router.get('/metrics', healthController.getMetrics.bind(healthController));
router.get('/metrics/system', healthController.getSystemMetrics.bind(healthController));

module.exports = router;
