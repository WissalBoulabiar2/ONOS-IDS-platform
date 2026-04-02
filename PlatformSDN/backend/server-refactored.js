// backend/server.js - Refactored main application
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import modules
const db = require('./db');
const config = require('./config');
const authMiddleware = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const onosRoutes = require('./routes/onos');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: db.isDatabaseReady() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/onos', onosRoutes);
app.use('/api/users', usersRoutes);

// Error handler
app.use(authMiddleware.errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize and start server
async function startServer() {
  try {
    // Initialize database
    const dbReady = await db.initializePool();
    if (!dbReady) {
      console.warn(
        '[Server] Warning: Database connection failed. Some features may not work.'
      );
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`[Server] Application running on http://localhost:${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Server] ONOS URL: http://${config.ONOS_CONFIG.host}:${config.ONOS_CONFIG.port}`);
    });
  } catch (error) {
    console.error('[Server] Fatal error:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[Server] Shutting down gracefully...');
  await db.closePool();
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
