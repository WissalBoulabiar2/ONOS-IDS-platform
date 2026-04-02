-- PlatformSDN/backend/migrations/001_initial_schema.sql
-- Initial database schema with optimized indexes

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  status VARCHAR(50),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  source VARCHAR(100),
  resource_id VARCHAR(255),
  resource_type VARCHAR(100),
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_triggered_at ON alerts(triggered_at DESC);
CREATE INDEX idx_alerts_source ON alerts(source);

-- Metrics snapshots table
CREATE TABLE IF NOT EXISTS metrics_snapshots (
  id SERIAL PRIMARY KEY,
  metric_type VARCHAR(100) NOT NULL,
  metric_name VARCHAR(255) NOT NULL,
  metric_value FLOAT NOT NULL,
  tags JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metrics_snapshots_metric_type ON metrics_snapshots(metric_type);
CREATE INDEX idx_metrics_snapshots_created_at ON metrics_snapshots(created_at DESC);
CREATE INDEX idx_metrics_snapshots_metric_name ON metrics_snapshots(metric_name);

-- Tenants table (for multi-tenancy)
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  config JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_is_active ON tenants(is_active);

-- User-Tenant relationship
CREATE TABLE IF NOT EXISTS user_tenants (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tenant_id)
);

CREATE INDEX idx_user_tenants_user_id ON user_tenants(user_id);
CREATE INDEX idx_user_tenants_tenant_id ON user_tenants(tenant_id);

-- Devices cache table
CREATE TABLE IF NOT EXISTS device_cache (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  device_data JSONB NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ttl_expires_at TIMESTAMP
);

CREATE INDEX idx_device_cache_device_id ON device_cache(device_id);
CREATE INDEX idx_device_cache_ttl_expires_at ON device_cache(ttl_expires_at);

-- API request cache table
CREATE TABLE IF NOT EXISTS api_request_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(500) UNIQUE NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_api_request_cache_cache_key ON api_request_cache(cache_key);
CREATE INDEX idx_api_request_cache_expires_at ON api_request_cache(expires_at);
