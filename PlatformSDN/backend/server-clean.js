// PlatformSDN/backend/server-clean.js - Clean server setup using modular architecture
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./db');
const config = require('./config');
const routes = require('./routes');
const rateLimiterAdvanced = require('./middleware/rate-limiter-advanced');
const securityHeaders = require('./middleware/security-headers');
const performanceMiddleware = require('./middleware/performance');
const metricsService = require('./services/metrics');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(securityHeaders);

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || NODE_ENV === 'production' ? 'https://localhost:3000' : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Performance monitoring
app.use(performanceMiddleware);

// Rate limiting
app.use(rateLimiterAdvanced.middleware());

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err);
  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// Database initialization
async function initializeDatabase() {
  try {
    console.log('[DB] Initializing database...');
    await db.initializePool();
    console.log('[DB] Database ready');
  } catch (error) {
    console.error('[DB] Initialization error:', error.message);
    process.exit(1);
  }
}

// Periodic tasks
function startPeriodicTasks() {
  // Save metrics every minute
  setInterval(async () => {
    try {
      await metricsService.saveMetricsSnapshot();
    } catch (error) {
      console.error('[Metrics] Save snapshot error:', error.message);
    }
  }, 60000);

  // Rate limiter cleanup every 5 minutes
  setInterval(() => {
    rateLimiterAdvanced.cleanup();
  }, 5 * 60 * 1000);

  console.log('[Server] Periodic tasks started');
}

// Start server
async function start() {
  try {
    await initializeDatabase();
    startPeriodicTasks();

    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT} (${NODE_ENV})`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received, shutting down gracefully');
  try {
    await db.closePool();
    process.exit(0);
  } catch (error) {
    console.error('[Server] Shutdown error:', error);
    process.exit(1);
  }
});

start();

module.exports = app;
