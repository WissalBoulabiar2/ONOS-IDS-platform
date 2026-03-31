BEGIN;

CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50),
    available BOOLEAN DEFAULT true,
    manufacturer VARCHAR(255),
    serial_number VARCHAR(255),
    port_count INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ports (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    port_number INT NOT NULL,
    port_speed VARCHAR(50),
    enabled BOOLEAN DEFAULT false,
    live BOOLEAN DEFAULT false,
    rx_bytes BIGINT DEFAULT 0,
    tx_bytes BIGINT DEFAULT 0,
    rx_packets BIGINT DEFAULT 0,
    tx_packets BIGINT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ports_device_port_unique UNIQUE (device_id, port_number),
    CONSTRAINT ports_device_fk FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS port_metrics (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    port_number INT NOT NULL,
    rx_bytes BIGINT DEFAULT 0,
    tx_bytes BIGINT DEFAULT 0,
    rx_packets BIGINT DEFAULT 0,
    tx_packets BIGINT DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT port_metrics_device_fk FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS topology_links (
    id SERIAL PRIMARY KEY,
    source_device VARCHAR(255) NOT NULL,
    source_port INT,
    target_device VARCHAR(255) NOT NULL,
    target_port INT,
    link_type VARCHAR(50),
    state VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT topology_links_unique UNIQUE (source_device, target_device, source_port, target_port)
);

CREATE TABLE IF NOT EXISTS flows (
    id SERIAL PRIMARY KEY,
    flow_id VARCHAR(255) UNIQUE NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    app_id VARCHAR(255),
    priority INT,
    table_id INT,
    state VARCHAR(50),
    selector JSONB,
    treatment JSONB,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT flows_device_fk FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS device_metrics (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    total_rx_bytes BIGINT DEFAULT 0,
    total_tx_bytes BIGINT DEFAULT 0,
    total_rx_packets BIGINT DEFAULT 0,
    total_tx_packets BIGINT DEFAULT 0,
    live_ports INT DEFAULT 0,
    enabled_ports INT DEFAULT 0,
    total_ports INT DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT device_metrics_device_fk FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sync_log (
    id SERIAL PRIMARY KEY,
    sync_type VARCHAR(50),
    status VARCHAR(50),
    records_synced INT DEFAULT 0,
    error_message TEXT,
    sync_duration_ms INT DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255),
    alert_type VARCHAR(100),
    severity VARCHAR(50),
    message TEXT,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    CONSTRAINT alerts_device_fk FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_available ON devices(available);
CREATE INDEX IF NOT EXISTS idx_devices_last_updated ON devices(last_updated);

CREATE INDEX IF NOT EXISTS idx_ports_device_id ON ports(device_id);
CREATE INDEX IF NOT EXISTS idx_ports_live ON ports(live);
CREATE INDEX IF NOT EXISTS idx_ports_last_updated ON ports(last_updated);

CREATE INDEX IF NOT EXISTS idx_port_metrics_device_port_time ON port_metrics(device_id, port_number, timestamp);
CREATE INDEX IF NOT EXISTS idx_port_metrics_timestamp ON port_metrics(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_topology_source ON topology_links(source_device);
CREATE INDEX IF NOT EXISTS idx_topology_target ON topology_links(target_device);
CREATE INDEX IF NOT EXISTS idx_topology_state ON topology_links(state);
CREATE INDEX IF NOT EXISTS idx_topology_last_updated ON topology_links(last_updated DESC);

CREATE INDEX IF NOT EXISTS idx_flows_device_id ON flows(device_id);
CREATE INDEX IF NOT EXISTS idx_flows_state ON flows(state);
CREATE INDEX IF NOT EXISTS idx_flows_app_id ON flows(app_id);
CREATE INDEX IF NOT EXISTS idx_flows_last_updated ON flows(last_updated DESC);

CREATE INDEX IF NOT EXISTS idx_device_metrics_device_time ON device_metrics(device_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_sync_log_type ON sync_log(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(status);
CREATE INDEX IF NOT EXISTS idx_sync_log_timestamp ON sync_log(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

COMMIT;
