// backend/config.js - Centralised configuration
module.exports = {
  ONOS_CONFIG: {
    host: process.env.ONOS_HOST || 'localhost',
    port: process.env.ONOS_PORT || 8181,
    user: process.env.ONOS_USER || 'karaf',
    password: process.env.ONOS_PASSWORD || 'karaf',
  },
  DATABASE: {
    user: process.env.DB_USER || 'sdnuser',
    password: process.env.DB_PASSWORD || 'sdnpass123',
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'sdn_platform',
  },
  JWT: {
    secret: process.env.JWT_SECRET || 'change-me-platformsdn-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  BCRYPT_SALT_ROUNDS: Number.parseInt(
    process.env.BCRYPT_SALT_ROUNDS || '10',
    10
  ),
  AUTO_SYNC: {
    enabled: process.env.ENABLE_AUTO_SYNC === 'true',
    interval: Number.parseInt(process.env.SYNC_INTERVAL_MS || '5000', 10),
  },
  DEFAULT_ADMIN: {
    fullName: process.env.DEFAULT_ADMIN_FULL_NAME || 'DNA Center Admin',
    username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@sdn.local',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
    role: 'admin',
  },
}
