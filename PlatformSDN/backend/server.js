const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { newDb } = require('pg-mem');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors());
app.use(express.json());

const ONOS_CONFIG = {
  host: process.env.ONOS_HOST || 'localhost',
  port: process.env.ONOS_PORT || 8181,
  user: process.env.ONOS_USER || 'karaf',
  password: process.env.ONOS_PASSWORD || 'karaf',
};

const ONOS_URL = `http://${ONOS_CONFIG.host}:${ONOS_CONFIG.port}`;
const ONOS_API = `${ONOS_URL}/onos/v1`;
const AUTO_SYNC_ENABLED = process.env.ENABLE_AUTO_SYNC === 'true';
const AUTO_SYNC_INTERVAL = Number.parseInt(process.env.SYNC_INTERVAL_MS || '5000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-platformsdn-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const BCRYPT_SALT_ROUNDS = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
const LOCAL_STORE_PATH = path.join(__dirname, 'dev-store.json');
const DEFAULT_ADMIN_USER = {
  fullName: process.env.DEFAULT_ADMIN_FULL_NAME || 'DNA Center Admin',
  username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
  email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@sdn.local',
  password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
  role: 'admin',
};
const FALLBACK_ADMIN_PASSWORD_HASH = bcrypt.hashSync(
  DEFAULT_ADMIN_USER.password,
  BCRYPT_SALT_ROUNDS
);
let databaseMode = 'postgresql';

function createExternalPool() {
  return new Pool({
    user: process.env.DB_USER || 'sdnuser',
    password: process.env.DB_PASSWORD || 'sdnpass123',
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'sdn_platform',
  });
}

let pool = createExternalPool();

const onos = axios.create({
  baseURL: ONOS_API,
  timeout: 8000,
  proxy: false,
  auth: {
    username: ONOS_CONFIG.user,
    password: ONOS_CONFIG.password,
  },
});

const onosVpls = axios.create({
  baseURL: `${ONOS_URL}/onos/vpls`,
  timeout: 8000,
  proxy: false,
  auth: {
    username: ONOS_CONFIG.user,
    password: ONOS_CONFIG.password,
  },
});

let isDatabaseReady = false;
let lastDatabaseError = null;
let syncTimer = null;
let syncInProgress = false;
let alertSyncPromise = null;

function attachPoolErrorHandler(activePool) {
  if (typeof activePool?.on !== 'function') {
    return;
  }

  activePool.on('error', (error) => {
    isDatabaseReady = false;
    lastDatabaseError = error.message;
    console.error('[DB] Idle client error:', error.message);
  });
}

attachPoolErrorHandler(pool);

function sanitizeUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    isActive: row.is_active,
    lastLogin: row.last_login,
    createdAt: row.created_at,
  };
}

function getFallbackAdminUser() {
  return {
    id: 0,
    username: DEFAULT_ADMIN_USER.username,
    email: DEFAULT_ADMIN_USER.email,
    full_name: DEFAULT_ADMIN_USER.fullName,
    role: DEFAULT_ADMIN_USER.role,
    is_active: true,
    last_login: null,
    created_at: new Date(0).toISOString(),
  };
}

function getLocalStoreDefaultState() {
  return {
    users: [
      {
        ...getFallbackAdminUser(),
        password_hash: FALLBACK_ADMIN_PASSWORD_HASH,
        updated_at: new Date(0).toISOString(),
      },
    ],
    alerts: [],
  };
}

function ensureDefaultLocalStoreUser(store) {
  const hasDefaultAdmin = (store.users || []).some(
    (user) =>
      String(user.email || '').toLowerCase() === DEFAULT_ADMIN_USER.email.toLowerCase() ||
      String(user.username || '').toLowerCase() === DEFAULT_ADMIN_USER.username.toLowerCase()
  );

  if (!hasDefaultAdmin) {
    store.users.unshift({
      ...getFallbackAdminUser(),
      password_hash: FALLBACK_ADMIN_PASSWORD_HASH,
      updated_at: new Date(0).toISOString(),
    });
  }

  return store;
}

function readLocalStore() {
  try {
    if (!fs.existsSync(LOCAL_STORE_PATH)) {
      const initialStore = getLocalStoreDefaultState();
      fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(initialStore, null, 2));
      return initialStore;
    }

    const raw = fs.readFileSync(LOCAL_STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);

    const store = {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
    };

    return ensureDefaultLocalStoreUser(store);
  } catch (error) {
    console.error('[LOCAL-STORE] Failed to read local store, recreating it:', error.message);
    const initialStore = getLocalStoreDefaultState();
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(initialStore, null, 2));
    return initialStore;
  }
}

function writeLocalStore(store) {
  const normalizedStore = ensureDefaultLocalStoreUser({
    users: Array.isArray(store.users) ? store.users : [],
    alerts: Array.isArray(store.alerts) ? store.alerts : [],
  });

  fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(normalizedStore, null, 2));
  return normalizedStore;
}

function nextLocalId(items) {
  return (
    items.reduce((maxId, item) => {
      const currentId = Number(item.id);
      return Number.isFinite(currentId) ? Math.max(maxId, currentId) : maxId;
    }, -1) + 1
  );
}

async function enableEmbeddedDatabase() {
  const database = newDb({
    autoCreateForeignKeyIndices: true,
  });

  const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'init-db.sql'), 'utf8');
  database.public.none(schemaSql);

  const adapter = database.adapters.createPg();
  pool = new adapter.Pool();
  attachPoolErrorHandler(pool);
  databaseMode = 'embedded-pgmem';
  isDatabaseReady = true;
  lastDatabaseError = null;

  return true;
}

function signJwtForUser(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function authServiceUnavailable(res) {
  return res.status(503).json({
    error: 'Authentication service unavailable',
    message: lastDatabaseError || 'Persistent authentication backend is unavailable',
  });
}

async function ensureAuthSchema() {
  if (!(await refreshDatabaseStatus())) {
    return false;
  }

  try {
    if (databaseMode !== 'embedded-pgmem') {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'operator',
          password_hash TEXT NOT NULL,
          is_active BOOLEAN DEFAULT true,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT users_role_check CHECK (role IN ('admin', 'operator', 'viewer'))
        )
      `);

      await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)');
    }

    const existingUser = await pool.query(
      `SELECT id
       FROM users
       WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)
       LIMIT 1`,
      [DEFAULT_ADMIN_USER.email, DEFAULT_ADMIN_USER.username]
    );

    if (existingUser.rows.length === 0) {
      const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_USER.password, BCRYPT_SALT_ROUNDS);

      await pool.query(
        `INSERT INTO users (
           username, email, full_name, role, password_hash, is_active, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())`,
        [
          DEFAULT_ADMIN_USER.username,
          DEFAULT_ADMIN_USER.email,
          DEFAULT_ADMIN_USER.fullName,
          DEFAULT_ADMIN_USER.role,
          passwordHash,
        ]
      );

      console.log(`[AUTH] Default admin user created: ${DEFAULT_ADMIN_USER.email}`);
    }

    return true;
  } catch (error) {
    console.error('[AUTH] Failed to initialize auth schema:', error.message);
    return false;
  }
}

async function authenticateRequest(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Missing or invalid bearer token',
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (!(await refreshDatabaseStatus())) {
      const localStore = readLocalStore();
      const localUser = localStore.users.find(
        (user) =>
          String(user.id) === String(payload.sub) ||
          String(user.email || '').toLowerCase() === String(payload.email || '').toLowerCase() ||
          String(user.username || '').toLowerCase() === String(payload.username || '').toLowerCase()
      );

      if (!localUser || !localUser.is_active) {
        return authServiceUnavailable(res);
      }

      req.auth = payload;
      req.currentUser = localUser;
      return next();
    }

    const result = await pool.query(
      `SELECT *
       FROM users
       WHERE id = $1 AND is_active = true
       LIMIT 1`,
      [payload.sub]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid session',
        message: 'User account is not available anymore',
      });
    }

    req.auth = payload;
    req.currentUser = result.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid token',
      message: error.message,
    });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.currentUser) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    if (!roles.includes(req.currentUser.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of these roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
}

function normalizeDeviceType(type) {
  const normalized = String(type || 'switch').toLowerCase();
  return ['switch', 'router', 'host'].includes(normalized) ? normalized : 'switch';
}

function toNumber(value) {
  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number.parseInt(String(value ?? 0), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function refreshDatabaseStatus() {
  try {
    await pool.query('SELECT 1');
    isDatabaseReady = true;
    lastDatabaseError = null;
    return true;
  } catch (error) {
    isDatabaseReady = false;
    lastDatabaseError = error.message;
    return false;
  }
}

async function safeSyncLog(
  syncType,
  status,
  recordsSynced = 0,
  errorMessage = null,
  syncDurationMs = 0
) {
  if (!isDatabaseReady) {
    return;
  }

  try {
    await pool.query(
      `INSERT INTO sync_log (sync_type, status, records_synced, error_message, sync_duration_ms, timestamp)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [syncType, status, recordsSynced, errorMessage, syncDurationMs]
    );
  } catch (error) {
    console.error('[DB] Failed to write sync log:', error.message);
  }
}

function formatDbDevice(row) {
  return {
    id: row.device_id,
    type: normalizeDeviceType(row.type),
    available: row.available,
    manufacturer: row.manufacturer || 'Unknown',
    serialNumber: row.serial_number || 'N/A',
    portCount: toNumber(row.port_count),
  };
}

function formatOnosDevice(device) {
  return {
    id: device.id,
    type: normalizeDeviceType(device.type),
    available: device.available !== false,
    manufacturer: device.mfr || 'Unknown',
    serialNumber: device.serialNumber || 'N/A',
  };
}

function formatOnosPort(port) {
  return {
    portNumber: port.portNumber,
    portSpeed: port.portSpeed || null,
    enabled: port.isEnabled || false,
    live: port.isLive || false,
    rxBytes: port.statistics?.rxBytes || 0,
    txBytes: port.statistics?.txBytes || 0,
    rxPackets: port.statistics?.rxPackets || 0,
    txPackets: port.statistics?.txPackets || 0,
  };
}

function formatOnosFlow(flow) {
  return {
    id: flow.id,
    flowId: flow.id,
    deviceId: flow.deviceId,
    appId: flow.appId,
    priority: flow.priority,
    tableId: flow.tableId,
    state: flow.state,
    selector: flow.selector || {},
    treatment: flow.treatment || {},
  };
}

function formatAlertRow(row) {
  return {
    id: String(row.id),
    type: row.alert_type,
    severity: row.severity,
    deviceId: row.device_id,
    message: row.message,
    resolved: row.resolved,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
}

function normalizeArrayPayload(payload, keys = []) {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  return [];
}

function normalizeObjectPayload(payload, keys = []) {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    for (const key of keys) {
      if (payload[key] && typeof payload[key] === 'object' && !Array.isArray(payload[key])) {
        return payload[key];
      }
    }

    return payload;
  }

  return {};
}

function normalizeVplsItems(payload) {
  return normalizeArrayPayload(payload, ['vpls', 'vplss', 'services', 'items']);
}

function normalizeLinkLoadEntries(payload) {
  return normalizeArrayPayload(payload, ['loads', 'statistics', 'links', 'entries']);
}

function buildAlertSignature(alert) {
  return [alert.alert_type, alert.device_id || '-', alert.message].join('::');
}

function dedupeDerivedAlerts(alerts) {
  const uniqueAlerts = new Map();

  for (const alert of alerts) {
    uniqueAlerts.set(buildAlertSignature(alert), alert);
  }

  return Array.from(uniqueAlerts.values());
}

function buildDerivedAlertsFromSnapshot({
  devices = [],
  links = [],
  flows = [],
  portsByDevice = [],
  controllerError = null,
}) {
  const derivedAlerts = [];

  if (controllerError) {
    derivedAlerts.push({
      device_id: null,
      alert_type: 'controller_unreachable',
      severity: 'critical',
      message: `ONOS controller is unreachable: ${controllerError}`,
    });

    return derivedAlerts;
  }

  if (devices.length === 0) {
    derivedAlerts.push({
      device_id: null,
      alert_type: 'inventory_empty',
      severity: 'warning',
      message: 'No devices are currently discovered in ONOS inventory.',
    });
  }

  for (const device of devices) {
    if (device.available === false) {
      derivedAlerts.push({
        device_id: device.id,
        alert_type: 'device_lost',
        severity: 'critical',
        message: `Device ${device.id} is unavailable from the ONOS inventory.`,
      });
    }
  }

  for (const link of links) {
    const state = String(link.state || 'ACTIVE').toUpperCase();

    if (state !== 'ACTIVE') {
      derivedAlerts.push({
        device_id: link.src?.device || null,
        alert_type: 'link_down',
        severity: 'critical',
        message: `Link ${link.src?.device || 'unknown'}:${link.src?.port || '?'} -> ${link.dst?.device || 'unknown'}:${link.dst?.port || '?'} is ${state.toLowerCase()}.`,
      });
    }
  }

  for (const portGroup of portsByDevice) {
    const degradedPorts = (portGroup.ports || []).filter((port) => port.isEnabled && !port.isLive);

    if (degradedPorts.length > 0) {
      derivedAlerts.push({
        device_id: portGroup.deviceId,
        alert_type: 'port_error',
        severity: degradedPorts.length >= 3 ? 'critical' : 'warning',
        message: `${degradedPorts.length} enabled port(s) are not live on device ${portGroup.deviceId}.`,
      });
    }
  }

  const pendingFlowsByDevice = new Map();

  for (const flow of flows) {
    const state = String(flow.state || '').toUpperCase();

    if (state.includes('PENDING')) {
      const current = pendingFlowsByDevice.get(flow.deviceId) || 0;
      pendingFlowsByDevice.set(flow.deviceId, current + 1);
    }
  }

  for (const [deviceId, totalPending] of pendingFlowsByDevice.entries()) {
    derivedAlerts.push({
      device_id: deviceId,
      alert_type: 'flow_error',
      severity: totalPending >= 5 ? 'critical' : 'warning',
      message: `${totalPending} pending flow rule(s) detected on device ${deviceId}.`,
    });
  }

  return dedupeDerivedAlerts(derivedAlerts);
}

function summarizeAlerts(alerts) {
  const openAlerts = alerts.filter((alert) => !alert.resolved);

  return {
    total: alerts.length,
    open: openAlerts.length,
    resolved: alerts.length - openAlerts.length,
    critical: openAlerts.filter((alert) => alert.severity === 'critical').length,
    warning: openAlerts.filter((alert) => alert.severity === 'warning').length,
    info: openAlerts.filter((alert) => alert.severity === 'info').length,
  };
}

function isClusterNodeOnline(node) {
  const state = String(node?.state || node?.status || '').toUpperCase();
  return (
    node?.online === true || node?.ready === true || ['ACTIVE', 'READY', 'ONLINE'].includes(state)
  );
}

function isApplicationActive(application) {
  const state = String(application?.state || application?.status || '').toUpperCase();
  return application?.active === true || state === 'ACTIVE';
}

function toFiniteNumberOrNull(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function roundTo(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function getNestedValue(source, path) {
  return path.reduce((current, key) => {
    if (current && typeof current === 'object') {
      return current[key];
    }

    return undefined;
  }, source);
}

function pickFirstString(source, paths) {
  for (const path of paths) {
    const value = getNestedValue(source, path.split('.'));

    if (value === undefined || value === null) {
      continue;
    }

    const text = String(value).trim();
    if (text) {
      return text;
    }
  }

  return null;
}

function pickFirstNumber(source, paths) {
  for (const path of paths) {
    const value = getNestedValue(source, path.split('.'));
    const parsed = toFiniteNumberOrNull(value);

    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

function normalizeMemoryMegabytes(value) {
  const numeric = toFiniteNumberOrNull(value);

  if (numeric === null) {
    return null;
  }

  const absolute = Math.abs(numeric);

  if (absolute >= 1024 * 1024) {
    return roundTo(numeric / (1024 * 1024));
  }

  if (absolute >= 8192) {
    return roundTo(numeric / 1024);
  }

  return roundTo(numeric);
}

function extractControllerRuntime(systemData) {
  const totalMemoryRaw = pickFirstNumber(systemData, [
    'memory.total',
    'memory.totalMemory',
    'totalMemory',
    'total_memory',
    'mem.max',
    'mem.committed',
    'heap.total',
    'heap.max',
    'jvm.memory.total',
    'jvm.memory.max',
  ]);

  const freeMemoryRaw = pickFirstNumber(systemData, [
    'memory.free',
    'memory.freeMemory',
    'freeMemory',
    'free_memory',
    'heap.free',
    'jvm.memory.free',
    'mem.free',
  ]);

  const usedMemoryRaw =
    pickFirstNumber(systemData, [
      'memory.used',
      'memory.usedMemory',
      'usedMemory',
      'used_memory',
      'mem.current',
      'heap.used',
      'jvm.memory.used',
    ]) ??
    (totalMemoryRaw !== null && freeMemoryRaw !== null ? totalMemoryRaw - freeMemoryRaw : null);

  const totalMemoryMb = normalizeMemoryMegabytes(totalMemoryRaw);
  const freeMemoryMb = normalizeMemoryMegabytes(freeMemoryRaw);
  const usedMemoryMb = normalizeMemoryMegabytes(usedMemoryRaw);
  const usedMemoryPercent =
    totalMemoryMb && usedMemoryMb !== null && totalMemoryMb > 0
      ? roundTo((usedMemoryMb / totalMemoryMb) * 100, 1)
      : null;

  return {
    node: pickFirstString(systemData, ['node', 'nodeId', 'system.node', 'hostname']),
    clusterId: pickFirstString(systemData, ['clusterId', 'cluster.id', 'system.clusterId']),
    os: pickFirstString(systemData, ['osName', 'os.name', 'system.osName', 'system.os.name', 'os']),
    javaVersion: pickFirstString(systemData, [
      'javaVersion',
      'java.version',
      'runtime.javaVersion',
      'jvm.version',
    ]),
    processors: pickFirstNumber(systemData, [
      'availableProcessors',
      'processors',
      'cpu.count',
      'cpu.cores',
    ]),
    totalMemoryMb,
    usedMemoryMb,
    freeMemoryMb,
    usedMemoryPercent,
    threadsLive: pickFirstNumber(systemData, ['threads.live', 'thread.live', 'jvm.threads.live']),
    threadsDaemon: pickFirstNumber(systemData, [
      'threads.daemon',
      'thread.daemon',
      'jvm.threads.daemon',
    ]),
    devices: pickFirstNumber(systemData, ['devices', 'inventory.devices']),
    links: pickFirstNumber(systemData, ['links', 'inventory.links']),
    hosts: pickFirstNumber(systemData, ['hosts', 'inventory.hosts']),
    flows: pickFirstNumber(systemData, ['flows', 'inventory.flows']),
  };
}

function normalizeMastershipNode(payload) {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string' || typeof payload === 'number') {
    const text = String(payload).trim();
    return text || null;
  }

  const directCandidates = [
    payload.master,
    payload.masterId,
    payload.masterNode,
    payload.nodeId,
    payload.controller,
    payload.leader,
    payload.id,
  ];

  for (const candidate of directCandidates) {
    if (candidate === undefined || candidate === null) {
      continue;
    }

    if (typeof candidate === 'object') {
      const nested = normalizeMastershipNode(candidate);
      if (nested) {
        return nested;
      }
      continue;
    }

    const text = String(candidate).trim();
    if (text) {
      return text;
    }
  }

  return null;
}

function buildClusterNodeStatusMap(clusterNodes) {
  const statusMap = new Map();

  for (const node of clusterNodes) {
    const online = isClusterNodeOnline(node);
    const aliases = [node?.id, node?.nodeId, node?.ip, node?.address]
      .filter(Boolean)
      .map((value) => String(value));

    for (const alias of aliases) {
      statusMap.set(alias, online);
    }
  }

  return statusMap;
}

async function fetchOnosDevicesRaw() {
  const response = await onos.get('/devices');
  return response.data.devices || [];
}

async function fetchOnosPortsRaw(deviceId) {
  const response = await onos.get(`/devices/${deviceId}/ports`);
  return response.data.ports || [];
}

async function fetchOnosLinksRaw() {
  const response = await onos.get('/links');
  return response.data.links || [];
}

async function fetchOnosPathsRaw(src, dst) {
  const response = await onos.get(`/paths/${encodeURIComponent(src)}/${encodeURIComponent(dst)}`);
  return normalizeArrayPayload(response.data, ['paths']);
}

async function fetchOnosFlowsRaw() {
  const response = await onos.get('/flows');
  return response.data.flows || [];
}

async function fetchOnosSystemRaw() {
  const response = await onos.get('/system');
  return response.data || {};
}

async function fetchOnosClusterRaw() {
  const response = await onos.get('/cluster');
  return normalizeArrayPayload(response.data, ['nodes', 'cluster', 'clusters']);
}

async function fetchOnosApplicationsRaw() {
  const response = await onos.get('/applications');
  return normalizeArrayPayload(response.data, ['applications', 'apps']);
}

async function fetchOnosHostsRaw() {
  const response = await onos.get('/hosts');
  return normalizeArrayPayload(response.data, ['hosts']);
}

function normalizeTopologySourceMode(value) {
  const candidate = String(value || 'onos').toLowerCase();
  return ['onos', 'database', 'auto'].includes(candidate) ? candidate : 'onos';
}

function buildTopologyEdgeLabel(sourcePort, targetPort, fallback = '') {
  const from = sourcePort ? String(sourcePort) : '';
  const to = targetPort ? String(targetPort) : '';
  const suffix = fallback ? ` • ${fallback}` : '';

  if (from && to) {
    return `${from} -> ${to}${suffix}`;
  }

  if (from || to) {
    return `${from || to}${suffix}`;
  }

  return fallback || '';
}

function buildTopologyEdgeId(source, target, sourcePort, targetPort) {
  return `${source}-${target}-${sourcePort || 'na'}-${targetPort || 'na'}`;
}

function mapOnosDeviceToTopologyNode(device) {
  return {
    id: device.id,
    label: device.id.split(':')[1] || device.id,
    type: normalizeDeviceType(device.type),
    available: device.available !== false,
    status: device.available !== false ? 'active' : 'inactive',
    manufacturer: device.manufacturer || device.mfr || null,
    hwVersion: device.hw || device.hwVersion || null,
    swVersion: device.sw || device.swVersion || null,
  };
}

function mapOnosLinkToTopologyEdge(link) {
  const sourcePort = link?.src?.port ? String(link.src.port) : null;
  const targetPort = link?.dst?.port ? String(link.dst.port) : null;

  return {
    id: buildTopologyEdgeId(link.src.device, link.dst.device, sourcePort, targetPort),
    source: link.src.device,
    target: link.dst.device,
    label: buildTopologyEdgeLabel(sourcePort, targetPort, link.type || ''),
    status: String(link.state || 'ACTIVE').toLowerCase() === 'active' ? 'active' : 'inactive',
    sourcePort,
    targetPort,
    kind: 'infrastructure',
  };
}

function mapOnosHostToTopologyNode(host) {
  const ipAddresses = normalizeArrayPayload(host, ['ipAddresses']).map((ip) => String(ip));
  const locations = normalizeArrayPayload(host, ['locations']);
  const primaryLocation = locations[0] || null;
  const mac = host.mac || String(host.id || '').split('/')[0] || null;
  const label = ipAddresses[0] || mac || host.id;

  return {
    id: host.id,
    label,
    type: 'host',
    available: locations.length > 0,
    status: locations.length > 0 ? 'active' : 'inactive',
    manufacturer: null,
    hwVersion: null,
    swVersion: null,
    mac,
    ipAddresses,
    vlan: host.vlan || null,
    location: primaryLocation ? `${primaryLocation.elementId}/${primaryLocation.port}` : null,
  };
}

function mapOnosHostToTopologyEdges(host) {
  const locations = [
    ...normalizeArrayPayload(host, ['locations']),
    ...normalizeArrayPayload(host, ['auxLocations']),
  ];

  return locations.map((location, index) => {
    const targetPort = location?.port ? String(location.port) : null;

    return {
      id: `${buildTopologyEdgeId(host.id, location.elementId, null, targetPort)}-${index}`,
      source: host.id,
      target: location.elementId,
      label: buildTopologyEdgeLabel(null, targetPort, 'host'),
      status: 'active',
      sourcePort: null,
      targetPort,
      kind: 'access',
    };
  });
}

async function getDatabaseTopologySnapshot() {
  const devicesResult = await pool.query('SELECT * FROM devices ORDER BY device_id ASC');
  const linksResult = await pool.query(
    'SELECT * FROM topology_links ORDER BY last_updated DESC, source_device ASC'
  );

  if (devicesResult.rows.length === 0) {
    return null;
  }

  return {
    source: 'database',
    nodes: devicesResult.rows.map((row) => ({
      id: row.device_id,
      label: row.device_id.split(':')[1] || row.device_id,
      type: normalizeDeviceType(row.type),
      available: row.available,
      status: row.available ? 'active' : 'inactive',
      manufacturer: row.manufacturer || null,
      serialNumber: row.serial_number || null,
    })),
    edges: linksResult.rows.map((row) => ({
      id: `${row.source_device}-${row.target_device}-${row.source_port || 'na'}-${row.target_port || 'na'}`,
      source: row.source_device,
      target: row.target_device,
      label: buildTopologyEdgeLabel(row.source_port, row.target_port, row.link_type || ''),
      status: String(row.state || 'ACTIVE').toLowerCase() === 'active' ? 'active' : 'inactive',
      sourcePort: row.source_port ? String(row.source_port) : null,
      targetPort: row.target_port ? String(row.target_port) : null,
      kind: 'infrastructure',
    })),
  };
}

async function fetchOnosIntentMiniSummaryRaw() {
  const response = await onos.get('/intents/minisummary');
  return normalizeObjectPayload(response.data, ['summary']);
}

async function fetchOnosApplicationHealthRaw(name) {
  const response = await onos.get(`/applications/${encodeURIComponent(name)}/health`);
  return response.data || {};
}

async function fetchOnosMastershipMasterRaw(deviceId) {
  const response = await onos.get(`/mastership/${encodeURIComponent(deviceId)}/master`);
  return response.data || {};
}

async function fetchOnosMetricsRaw() {
  const response = await onos.get('/metrics');
  return normalizeArrayPayload(response.data, ['metrics', 'items']);
}

async function fetchOnosLinkLoadRaw() {
  const response = await onos.get('/statistics/flows/link');
  return normalizeLinkLoadEntries(response.data);
}

async function fetchOnosVplsRaw() {
  const response = await onosVpls.get('');
  return normalizeVplsItems(response.data);
}

async function buildMastershipSnapshot(devices, clusterNodes) {
  const sampledDevices = devices.slice(0, 12);

  if (sampledDevices.length === 0) {
    return {
      totalDevices: 0,
      sampledDevices: 0,
      resolvedDevices: 0,
      unresolvedDevices: 0,
      leaders: [],
      devices: [],
    };
  }

  const clusterNodeStatus = buildClusterNodeStatusMap(clusterNodes);

  const deviceAssignments = await Promise.all(
    sampledDevices.map(async (device) => {
      try {
        const payload = await fetchOnosMastershipMasterRaw(device.id);
        return {
          deviceId: device.id,
          master: normalizeMastershipNode(payload),
          available: device.available !== false,
        };
      } catch {
        return {
          deviceId: device.id,
          master: null,
          available: device.available !== false,
        };
      }
    })
  );

  const leadersMap = new Map();

  for (const assignment of deviceAssignments) {
    if (!assignment.master) {
      continue;
    }

    leadersMap.set(assignment.master, (leadersMap.get(assignment.master) || 0) + 1);
  }

  const leaders = [...leadersMap.entries()]
    .map(([controller, devicesOwned]) => ({
      controller,
      devices: devicesOwned,
      online: clusterNodeStatus.has(controller) ? clusterNodeStatus.get(controller) : null,
    }))
    .sort(
      (left, right) =>
        right.devices - left.devices || left.controller.localeCompare(right.controller)
    )
    .slice(0, 4);

  return {
    totalDevices: devices.length,
    sampledDevices: sampledDevices.length,
    resolvedDevices: deviceAssignments.filter((assignment) => Boolean(assignment.master)).length,
    unresolvedDevices: deviceAssignments.filter((assignment) => !assignment.master).length,
    leaders,
    devices: deviceAssignments.slice(0, 6),
  };
}

function extractMetricKind(metricEntry) {
  const payload = metricEntry?.metric;

  if (!payload || typeof payload !== 'object') {
    return 'unknown';
  }

  const keys = Object.keys(payload);
  return keys[0] || 'unknown';
}

function buildMetricsSnapshot(metricsEntries) {
  const kindCounts = {
    timer: 0,
    counter: 0,
    gauge: 0,
    meter: 0,
    histogram: 0,
  };

  const normalizedEntries = metricsEntries.map((entry) => {
    const kind = extractMetricKind(entry);
    const values = entry?.metric?.[kind] || {};

    if (Object.prototype.hasOwnProperty.call(kindCounts, kind)) {
      kindCounts[kind] += 1;
    }

    return {
      name: String(entry?.name || 'unknown'),
      kind,
      counter: toFiniteNumberOrNull(values.counter),
      meanRate: toFiniteNumberOrNull(values.mean_rate ?? values.meanRate ?? values.rate),
      max: toFiniteNumberOrNull(values.max),
    };
  });

  const highlighted = normalizedEntries
    .sort((left, right) => {
      const leftPrimary = left.meanRate ?? left.counter ?? left.max ?? 0;
      const rightPrimary = right.meanRate ?? right.counter ?? right.max ?? 0;
      return rightPrimary - leftPrimary || left.name.localeCompare(right.name);
    })
    .slice(0, 5);

  return {
    totalMetrics: metricsEntries.length,
    timers: kindCounts.timer,
    counters: kindCounts.counter,
    gauges: kindCounts.gauge,
    meters: kindCounts.meter,
    histograms: kindCounts.histogram,
    highlighted,
  };
}

function buildVplsSnapshot(vplsItems) {
  const totalInterfaces = vplsItems.reduce(
    (sum, item) => sum + normalizeArrayPayload(item, ['interfaces']).length,
    0
  );
  const encapsulationCounts = new Map();

  for (const item of vplsItems) {
    const encapsulation = String(item?.encapsulation || 'Unknown');
    encapsulationCounts.set(encapsulation, (encapsulationCounts.get(encapsulation) || 0) + 1);
  }

  const encapsulations = [...encapsulationCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, 4);

  return {
    totalServices: vplsItems.length,
    totalInterfaces,
    encapsulations,
    services: vplsItems.slice(0, 4).map((item) => ({
      name: String(item?.name || 'unknown'),
      encapsulation: item?.encapsulation ? String(item.encapsulation) : null,
      interfaces: normalizeArrayPayload(item, ['interfaces']).length,
    })),
  };
}

async function checkOnosHealth() {
  try {
    await onos.get('/devices');
    return { connected: true, error: null };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

async function generateLiveAlerts() {
  const onosStatus = await checkOnosHealth();

  if (!onosStatus.connected) {
    return buildDerivedAlertsFromSnapshot({
      controllerError: onosStatus.error,
    });
  }

  const [devices, links, flows] = await Promise.all([
    fetchOnosDevicesRaw(),
    fetchOnosLinksRaw(),
    fetchOnosFlowsRaw(),
  ]);

  const portsByDevice = await Promise.all(
    devices.map(async (device) => {
      try {
        const ports = await fetchOnosPortsRaw(device.id);
        return { deviceId: device.id, ports };
      } catch {
        return { deviceId: device.id, ports: [] };
      }
    })
  );

  return buildDerivedAlertsFromSnapshot({
    devices,
    links,
    flows,
    portsByDevice,
  });
}

async function syncDerivedAlerts() {
  if (alertSyncPromise) {
    return alertSyncPromise;
  }

  alertSyncPromise = (async () => {
    const liveAlerts = await generateLiveAlerts();

    if (!(await refreshDatabaseStatus())) {
      const store = readLocalStore();
      const existingOpenAlerts = store.alerts.filter((alert) => !alert.resolved);
      const existingBySignature = new Map(
        existingOpenAlerts.map((alert) => [
          buildAlertSignature({
            alert_type: alert.alert_type,
            device_id: alert.device_id,
            message: alert.message,
          }),
          alert,
        ])
      );

      const activeSignatures = new Set();

      for (const alert of liveAlerts) {
        const signature = buildAlertSignature(alert);
        activeSignatures.add(signature);

        if (!existingBySignature.has(signature)) {
          store.alerts.push({
            id: nextLocalId(store.alerts),
            device_id: alert.device_id,
            alert_type: alert.alert_type,
            severity: alert.severity,
            message: alert.message,
            resolved: false,
            created_at: new Date().toISOString(),
            resolved_at: null,
          });
        }
      }

      for (const alert of existingOpenAlerts) {
        const signature = buildAlertSignature({
          alert_type: alert.alert_type,
          device_id: alert.device_id,
          message: alert.message,
        });

        if (!activeSignatures.has(signature)) {
          alert.resolved = true;
          alert.resolved_at = new Date().toISOString();
        }
      }

      const updatedStore = writeLocalStore(store);

      return {
        source: 'local-store',
        alerts: updatedStore.alerts
          .slice()
          .sort(
            (left, right) =>
              new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
          )
          .map(formatAlertRow),
      };
    }

    if (databaseMode === 'embedded-pgmem') {
      await syncDevices();
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const existingResult = await client.query(
        `SELECT id, device_id, alert_type, severity, message
         FROM alerts
         WHERE resolved = false`
      );

      const existingBySignature = new Map(
        existingResult.rows.map((row) => [
          buildAlertSignature({
            alert_type: row.alert_type,
            device_id: row.device_id,
            message: row.message,
          }),
          row,
        ])
      );

      const activeSignatures = new Set();

      for (const alert of liveAlerts) {
        const signature = buildAlertSignature(alert);
        activeSignatures.add(signature);

        if (!existingBySignature.has(signature)) {
          await client.query(
            `INSERT INTO alerts (device_id, alert_type, severity, message, resolved, created_at)
             VALUES ($1, $2, $3, $4, false, NOW())`,
            [alert.device_id, alert.alert_type, alert.severity, alert.message]
          );
        }
      }

      const staleAlertIds = existingResult.rows
        .filter((row) => {
          const signature = buildAlertSignature({
            alert_type: row.alert_type,
            device_id: row.device_id,
            message: row.message,
          });

          return !activeSignatures.has(signature);
        })
        .map((row) => row.id);

      if (staleAlertIds.length > 0) {
        await client.query(
          `UPDATE alerts
           SET resolved = true,
               resolved_at = NOW()
           WHERE id = ANY($1::int[])`,
          [staleAlertIds]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    const alertsResult = await pool.query(
      `SELECT *
       FROM alerts
       ORDER BY created_at DESC, id DESC`
    );

    return {
      source: 'database',
      alerts: alertsResult.rows.map(formatAlertRow),
    };
  })();

  try {
    return await alertSyncPromise;
  } finally {
    alertSyncPromise = null;
  }
}

async function syncDevices() {
  if (!(await refreshDatabaseStatus())) {
    return { synced: 0, skipped: true, error: lastDatabaseError };
  }

  const startedAt = Date.now();

  try {
    const devices = await fetchOnosDevicesRaw();

    for (const device of devices) {
      await pool.query(
        `INSERT INTO devices (device_id, type, available, manufacturer, serial_number, port_count, last_updated)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (device_id) DO UPDATE SET
           type = EXCLUDED.type,
           available = EXCLUDED.available,
           manufacturer = EXCLUDED.manufacturer,
           serial_number = EXCLUDED.serial_number,
           port_count = EXCLUDED.port_count,
           last_updated = NOW()`,
        [
          device.id,
          normalizeDeviceType(device.type),
          device.available !== false,
          device.mfr || 'Unknown',
          device.serialNumber || 'N/A',
          0,
        ]
      );
    }

    await safeSyncLog('devices', 'success', devices.length, null, Date.now() - startedAt);
    return { synced: devices.length };
  } catch (error) {
    console.error('[SYNC] Device sync error:', error.message);
    await safeSyncLog('devices', 'error', 0, error.message, Date.now() - startedAt);
    return { synced: 0, error: error.message };
  }
}

async function syncPorts() {
  if (!(await refreshDatabaseStatus())) {
    return { synced: 0, skipped: true, error: lastDatabaseError };
  }

  const startedAt = Date.now();
  let totalPorts = 0;

  try {
    const devices = await fetchOnosDevicesRaw();

    for (const device of devices) {
      try {
        const ports = await fetchOnosPortsRaw(device.id);

        for (const port of ports) {
          await pool.query(
            `INSERT INTO ports (
               device_id, port_number, port_speed, enabled, live,
               rx_bytes, tx_bytes, rx_packets, tx_packets, last_updated
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
             ON CONFLICT (device_id, port_number) DO UPDATE SET
               port_speed = EXCLUDED.port_speed,
               enabled = EXCLUDED.enabled,
               live = EXCLUDED.live,
               rx_bytes = EXCLUDED.rx_bytes,
               tx_bytes = EXCLUDED.tx_bytes,
               rx_packets = EXCLUDED.rx_packets,
               tx_packets = EXCLUDED.tx_packets,
               last_updated = NOW()`,
            [
              device.id,
              port.portNumber,
              port.portSpeed || null,
              port.isEnabled || false,
              port.isLive || false,
              port.statistics?.rxBytes || 0,
              port.statistics?.txBytes || 0,
              port.statistics?.rxPackets || 0,
              port.statistics?.txPackets || 0,
            ]
          );

          await pool.query(
            `INSERT INTO port_metrics (
               device_id, port_number, rx_bytes, tx_bytes, rx_packets, tx_packets, timestamp
             )
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [
              device.id,
              port.portNumber,
              port.statistics?.rxBytes || 0,
              port.statistics?.txBytes || 0,
              port.statistics?.rxPackets || 0,
              port.statistics?.txPackets || 0,
            ]
          );

          totalPorts += 1;
        }

        await pool.query(
          'UPDATE devices SET port_count = $1, last_updated = NOW() WHERE device_id = $2',
          [ports.length, device.id]
        );
      } catch (error) {
        console.error(`[SYNC] Port sync error for ${device.id}:`, error.message);
      }
    }

    await safeSyncLog('ports', 'success', totalPorts, null, Date.now() - startedAt);
    return { synced: totalPorts };
  } catch (error) {
    console.error('[SYNC] Port sync error:', error.message);
    await safeSyncLog('ports', 'error', 0, error.message, Date.now() - startedAt);
    return { synced: 0, error: error.message };
  }
}

async function syncTopology() {
  if (!(await refreshDatabaseStatus())) {
    return { synced: 0, skipped: true, error: lastDatabaseError };
  }

  const startedAt = Date.now();

  try {
    const links = await fetchOnosLinksRaw();

    for (const link of links) {
      await pool.query(
        `INSERT INTO topology_links (
           source_device, source_port, target_device, target_port, link_type, state, last_updated
         )
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (source_device, target_device, source_port, target_port) DO UPDATE SET
           link_type = EXCLUDED.link_type,
           state = EXCLUDED.state,
           last_updated = NOW()`,
        [
          link.src.device,
          link.src.port || null,
          link.dst.device,
          link.dst.port || null,
          link.type || 'DIRECT',
          link.state || 'ACTIVE',
        ]
      );
    }

    await safeSyncLog('topology', 'success', links.length, null, Date.now() - startedAt);
    return { synced: links.length };
  } catch (error) {
    console.error('[SYNC] Topology sync error:', error.message);
    await safeSyncLog('topology', 'error', 0, error.message, Date.now() - startedAt);
    return { synced: 0, error: error.message };
  }
}

async function syncFlows() {
  if (!(await refreshDatabaseStatus())) {
    return { synced: 0, skipped: true, error: lastDatabaseError };
  }

  const startedAt = Date.now();

  try {
    const flows = await fetchOnosFlowsRaw();

    for (const flow of flows) {
      await pool.query(
        `INSERT INTO flows (
           flow_id, device_id, app_id, priority, table_id, state, selector, treatment, last_updated
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, NOW())
         ON CONFLICT (flow_id) DO UPDATE SET
           device_id = EXCLUDED.device_id,
           app_id = EXCLUDED.app_id,
           priority = EXCLUDED.priority,
           table_id = EXCLUDED.table_id,
           state = EXCLUDED.state,
           selector = EXCLUDED.selector,
           treatment = EXCLUDED.treatment,
           last_updated = NOW()`,
        [
          flow.id,
          flow.deviceId,
          flow.appId || 'unknown',
          flow.priority || 0,
          flow.tableId || 0,
          flow.state || 'PENDING_ADD',
          JSON.stringify(flow.selector || {}),
          JSON.stringify(flow.treatment || {}),
        ]
      );
    }

    await safeSyncLog('flows', 'success', flows.length, null, Date.now() - startedAt);
    return { synced: flows.length };
  } catch (error) {
    console.error('[SYNC] Flow sync error:', error.message);
    await safeSyncLog('flows', 'error', 0, error.message, Date.now() - startedAt);
    return { synced: 0, error: error.message };
  }
}

async function performFullSync() {
  if (syncInProgress) {
    console.warn('[SYNC] Previous sync cycle still running, skipping this interval.');
    return;
  }

  if (!AUTO_SYNC_ENABLED) {
    return;
  }

  if (!(await refreshDatabaseStatus())) {
    console.warn('[SYNC] Database unavailable, sync skipped:', lastDatabaseError);
    return;
  }

  syncInProgress = true;
  console.log(`[SYNC] Starting cycle at ${new Date().toISOString()}`);

  try {
    await syncDevices();
    await syncPorts();
    await syncTopology();
    await syncFlows();
    console.log('[SYNC] Cycle completed');
  } finally {
    syncInProgress = false;
  }
}

function startAutoSync() {
  if (!AUTO_SYNC_ENABLED) {
    console.log('[SYNC] Auto-sync disabled');
    return;
  }

  console.log(`[SYNC] Auto-sync enabled every ${AUTO_SYNC_INTERVAL}ms`);
  void performFullSync();
  syncTimer = setInterval(() => {
    void performFullSync();
  }, AUTO_SYNC_INTERVAL);
}

async function getLiveDashboardStats() {
  const devices = await fetchOnosDevicesRaw();
  const links = await fetchOnosLinksRaw();
  const flows = await fetchOnosFlowsRaw();
  const portGroups = await Promise.all(
    devices.map(async (device) => {
      try {
        return await fetchOnosPortsRaw(device.id);
      } catch {
        return [];
      }
    })
  );

  const allPorts = portGroups.flat();
  const derivedAlerts = buildDerivedAlertsFromSnapshot({
    devices,
    links,
    flows,
    portsByDevice: portGroups.map((ports, index) => ({
      deviceId: devices[index]?.id || `device-${index}`,
      ports,
    })),
  });

  return {
    total_devices: devices.length,
    online_devices: devices.filter((device) => device.available !== false).length,
    offline_devices: devices.filter((device) => device.available === false).length,
    total_ports: allPorts.length,
    live_ports: allPorts.filter((port) => port.isLive).length,
    enabled_ports: allPorts.filter((port) => port.isEnabled).length,
    total_flows: flows.length,
    active_alerts: derivedAlerts.length,
    active_links: links.filter((link) => String(link.state || 'ACTIVE').toUpperCase() === 'ACTIVE')
      .length,
  };
}

async function getLiveDeviceMetrics() {
  const devices = await fetchOnosDevicesRaw();

  return Promise.all(
    devices.map(async (device) => {
      let ports = [];

      try {
        ports = await fetchOnosPortsRaw(device.id);
      } catch {
        ports = [];
      }

      return {
        device_id: device.id,
        type: normalizeDeviceType(device.type),
        available: device.available !== false,
        live_ports: ports.filter((port) => port.isLive).length,
        enabled_ports: ports.filter((port) => port.isEnabled).length,
        total_ports: ports.length,
        total_rx_bytes: ports.reduce((sum, port) => sum + (port.statistics?.rxBytes || 0), 0),
        total_tx_bytes: ports.reduce((sum, port) => sum + (port.statistics?.txBytes || 0), 0),
        last_updated: new Date().toISOString(),
      };
    })
  );
}

app.post('/api/auth/register', async (req, res) => {
  const username = String(req.body?.username || '').trim();
  const email = String(req.body?.email || '').trim();
  const password = String(req.body?.password || '');
  const fullName = String(req.body?.fullName || '').trim();

  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Username, email, and password are required',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: 'Password too weak',
      message: 'Password must be at least 8 characters',
    });
  }

  if (!(await refreshDatabaseStatus())) {
    const localStore = readLocalStore();

    // Check if user exists
    const existingUser = localStore.users.find(
      (u) =>
        String(u.username || '').toLowerCase() === username.toLowerCase() ||
        String(u.email || '').toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'Username or email already registered',
      });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 12);
      const newUser = {
        id: `user_${Date.now()}`,
        username,
        email,
        full_name: fullName || username,
        password_hash: passwordHash,
        role: 'operator',
        is_active: true,
        created_at: new Date().toISOString(),
      };

      localStore.users.push(newUser);
      writeLocalStore(localStore);

      res.status(201).json({
        message: 'Registration successful',
        user: sanitizeUser(newUser),
      });
    } catch (error) {
      res.status(500).json({
        error: 'Registration failed',
        message: error.message,
      });
    }
  } else {
    // Database available path
    try {
      // Check if user exists
      const userExists = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username.toLowerCase(), email.toLowerCase()]
      );

      if (userExists.rows.length > 0) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'Username or email already registered',
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const result = await pool.query(
        `INSERT INTO users (username, email, full_name, password_hash, role, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, true, NOW())
         RETURNING id, username, email, full_name, role, created_at`,
        [username.toLowerCase(), email, fullName || username, passwordHash, 'operator']
      );

      const newUser = result.rows[0];
      res.status(201).json({
        message: 'Registration successful',
        user: sanitizeUser(newUser),
      });
    } catch (error) {
      res.status(500).json({
        error: 'Registration failed',
        message: error.message,
      });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  const identifier = String(req.body?.identifier || '').trim();
  const password = String(req.body?.password || '');

  if (!identifier || !password) {
    return res.status(400).json({
      error: 'Missing credentials',
      message: 'Identifier and password are required',
    });
  }

  if (!(await refreshDatabaseStatus())) {
    const localStore = readLocalStore();
    const localUser = localStore.users.find(
      (user) =>
        String(user.email || '').toLowerCase() === identifier.toLowerCase() ||
        String(user.username || '').toLowerCase() === identifier.toLowerCase()
    );

    if (!localUser) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email/username or password is incorrect',
      });
    }

    const matchesPassword = await bcrypt.compare(password, localUser.password_hash);

    if (!matchesPassword || !localUser.is_active) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email/username or password is incorrect',
      });
    }

    localUser.last_login = new Date().toISOString();
    localUser.updated_at = new Date().toISOString();
    writeLocalStore(localStore);

    const fallbackUser = {
      ...localUser,
      last_login: new Date().toISOString(),
    };
    const token = signJwtForUser(fallbackUser);

    return res.json({
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: sanitizeUser(fallbackUser),
      degradedMode: true,
    });
  }

  try {
    const result = await pool.query(
      `SELECT *
       FROM users
       WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)
       LIMIT 1`,
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email/username or password is incorrect',
      });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches || !user.is_active) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email/username or password is incorrect',
      });
    }

    await pool.query('UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1', [
      user.id,
    ]);

    const updatedUser = { ...user, last_login: new Date().toISOString() };
    const token = signJwtForUser(updatedUser);

    return res.json({
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Login failed',
      message: error.message,
    });
  }
});

app.get('/api/health', async (_req, res) => {
  const onosStatus = await checkOnosHealth();
  const databaseConnected = await refreshDatabaseStatus();
  const degraded = onosStatus.connected && AUTO_SYNC_ENABLED && !databaseConnected;
  const status = onosStatus.connected ? (degraded ? 'DEGRADED' : 'OK') : 'ERROR';

  res.status(onosStatus.connected ? 200 : 503).json({
    status,
    message: onosStatus.connected
      ? 'SDN Platform backend is reachable'
      : 'ONOS controller is unreachable',
    timestamp: new Date().toISOString(),
    onos: {
      url: ONOS_URL,
      connected: onosStatus.connected,
      error: onosStatus.error,
    },
    database: {
      connected: databaseConnected,
      error: lastDatabaseError,
      mode: databaseConnected ? databaseMode : 'unavailable',
    },
    sync: {
      enabled: AUTO_SYNC_ENABLED,
      intervalMs: AUTO_SYNC_INTERVAL,
      inProgress: syncInProgress,
    },
    auth: {
      jwtConfigured: Boolean(JWT_SECRET),
      bootstrapAdmin: DEFAULT_ADMIN_USER.email,
      databaseBacked: databaseConnected,
      localStoreBacked: !databaseConnected,
    },
  });
});

app.use('/api', (req, res, next) => {
  if (req.path === '/health' || (req.path === '/auth/login' && req.method === 'POST')) {
    return next();
  }

  return authenticateRequest(req, res, next);
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    user: sanitizeUser(req.currentUser),
  });
});

app.post('/api/auth/logout', (req, res) => {
  // Invalidate token-based session
  // In a production system, add token to blacklist
  res.json({ message: 'Logged out successfully' });
});

// In-memory store for password reset tokens
const resetTokens = new Map();

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Missing email',
      message: 'Email is required',
    });
  }

  if (!(await refreshDatabaseStatus())) {
    const localStore = readLocalStore();
    const user = localStore.users.find(
      (u) => String(u.email || '').toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      // Return success even if user not found (security best practice)
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 3600000;

    resetTokens.set(resetToken, {
      userId: user.id,
      email: user.email,
      expiresAt,
    });

    // In a real application, send email with reset link
    // For now, just return success
    res.json({ message: 'If the email exists, a reset link has been sent' });
  } else {
    // Database available path
    try {
      const result = await pool.query('SELECT id, email FROM users WHERE email = $1', [
        email.toLowerCase(),
      ]);

      if (result.rows.length === 0) {
        return res.json({ message: 'If the email exists, a reset link has been sent' });
      }

      const user = result.rows[0];
      const resetToken = require('crypto').randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 3600000;

      resetTokens.set(resetToken, {
        userId: user.id,
        email: user.email,
        expiresAt,
      });

      res.json({ message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to process request',
        message: error.message,
      });
    }
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      error: 'Missing fields',
      message: 'Token and password are required',
    });
  }

  const resetData = resetTokens.get(token);
  if (!resetData || resetData.expiresAt < Date.now()) {
    return res.status(400).json({
      error: 'Invalid or expired token',
      message: 'Reset link has expired or is invalid',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: 'Password too weak',
      message: 'Password must be at least 8 characters',
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    if (!(await refreshDatabaseStatus())) {
      const localStore = readLocalStore();
      const user = localStore.users.find((u) => u.id === resetData.userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User account not found',
        });
      }

      user.password_hash = passwordHash;
      writeLocalStore(localStore);
    } else {
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
        passwordHash,
        resetData.userId,
      ]);
    }

    // Invalidate token
    resetTokens.delete(token);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to reset password',
      message: error.message,
    });
  }
});

app.get('/api/users', requireRole('admin'), async (_req, res) => {
  if (!(await refreshDatabaseStatus())) {
    const localStore = readLocalStore();

    return res.json({
      total: localStore.users.length,
      users: localStore.users
        .slice()
        .sort(
          (left, right) =>
            new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
        )
        .map(sanitizeUser),
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, email, full_name, role, is_active, last_login, created_at
       FROM users
       ORDER BY created_at DESC, username ASC`
    );

    res.json({
      total: result.rows.length,
      users: result.rows.map(sanitizeUser),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message,
    });
  }
});

app.post('/api/users', requireRole('admin'), async (req, res) => {
  const username = String(req.body?.username || '').trim();
  const email = String(req.body?.email || '').trim();
  const fullName = String(req.body?.fullName || '').trim();
  const password = String(req.body?.password || '');
  const role = String(req.body?.role || 'operator')
    .trim()
    .toLowerCase();

  if (!username || !email || !fullName || !password) {
    return res.status(400).json({
      error: 'Missing user data',
      message: 'Username, email, full name, and password are required',
    });
  }

  if (!['admin', 'operator', 'viewer'].includes(role)) {
    return res.status(400).json({
      error: 'Invalid role',
      message: 'Role must be admin, operator, or viewer',
    });
  }

  if (!(await refreshDatabaseStatus())) {
    const localStore = readLocalStore();
    const duplicateUser = localStore.users.find(
      (user) =>
        String(user.email || '').toLowerCase() === email.toLowerCase() ||
        String(user.username || '').toLowerCase() === username.toLowerCase()
    );

    if (duplicateUser) {
      return res.status(409).json({
        error: 'Duplicate user',
        message: 'Username or email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const createdUser = {
      id: nextLocalId(localStore.users),
      username,
      email,
      full_name: fullName,
      role,
      password_hash: passwordHash,
      is_active: true,
      last_login: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStore.users.push(createdUser);
    writeLocalStore(localStore);

    return res.status(201).json({
      message: 'User created successfully',
      user: sanitizeUser(createdUser),
      degradedMode: true,
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const result = await pool.query(
      `INSERT INTO users (
         username, email, full_name, role, password_hash, is_active, created_at, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
       RETURNING id, username, email, full_name, role, is_active, last_login, created_at`,
      [username, email, fullName, role, passwordHash]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: sanitizeUser(result.rows[0]),
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Duplicate user',
        message: 'Username or email already exists',
      });
    }

    return res.status(500).json({
      error: 'Failed to create user',
      message: error.message,
    });
  }
});

app.get('/api/devices', async (_req, res) => {
  const databaseConnected = await refreshDatabaseStatus();

  if (databaseConnected) {
    try {
      const result = await pool.query(
        'SELECT * FROM devices ORDER BY last_updated DESC, device_id ASC'
      );

      if (result.rows.length > 0) {
        return res.json({
          total: result.rows.length,
          source: 'database',
          devices: result.rows.map(formatDbDevice),
        });
      }
    } catch (error) {
      console.error('[API] Database devices fallback:', error.message);
    }
  }

  try {
    const devices = await fetchOnosDevicesRaw();
    res.json({
      total: devices.length,
      source: 'onos',
      devices: devices.map(formatOnosDevice),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch devices',
      message: error.message,
    });
  }
});

app.get('/api/devices/:deviceId/ports', async (req, res) => {
  const { deviceId } = req.params;
  const databaseConnected = await refreshDatabaseStatus();

  if (databaseConnected) {
    try {
      const result = await pool.query(
        'SELECT * FROM ports WHERE device_id = $1 ORDER BY port_number',
        [deviceId]
      );

      if (result.rows.length > 0) {
        return res.json({
          deviceId,
          total: result.rows.length,
          source: 'database',
          ports: result.rows.map((row) => ({
            portNumber: toNumber(row.port_number),
            portSpeed: row.port_speed,
            enabled: row.enabled,
            live: row.live,
            rxBytes: toNumber(row.rx_bytes),
            txBytes: toNumber(row.tx_bytes),
            rxPackets: toNumber(row.rx_packets),
            txPackets: toNumber(row.tx_packets),
          })),
        });
      }
    } catch (error) {
      console.error('[API] Database ports fallback:', error.message);
    }
  }

  try {
    const ports = await fetchOnosPortsRaw(deviceId);
    res.json({
      deviceId,
      total: ports.length,
      source: 'onos',
      ports: ports.map(formatOnosPort),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch ports',
      message: error.message,
    });
  }
});

app.get('/api/topology', async (req, res) => {
  const sourceMode = normalizeTopologySourceMode(req.query?.source);
  const databaseConnected = await refreshDatabaseStatus();

  if ((sourceMode === 'database' || sourceMode === 'auto') && databaseConnected) {
    try {
      const snapshot = await getDatabaseTopologySnapshot();

      if (snapshot) {
        return res.json(snapshot);
      }
    } catch (error) {
      console.error('[API] Database topology fallback:', error.message);
    }
  }

  if (sourceMode === 'database') {
    return res.status(404).json({
      error: 'Topology snapshot unavailable',
      message: databaseConnected
        ? 'No topology snapshot was found in the database'
        : 'Database topology mode is unavailable because the database is not connected',
    });
  }

  try {
    const [devices, links, hosts] = await Promise.all([
      fetchOnosDevicesRaw(),
      fetchOnosLinksRaw(),
      fetchOnosHostsRaw(),
    ]);

    res.json({
      source: 'onos',
      nodes: [...devices.map(mapOnosDeviceToTopologyNode), ...hosts.map(mapOnosHostToTopologyNode)],
      edges: [
        ...links.map(mapOnosLinkToTopologyEdge),
        ...hosts.flatMap(mapOnosHostToTopologyEdges),
      ],
    });
  } catch (error) {
    if (sourceMode === 'auto' && databaseConnected) {
      try {
        const snapshot = await getDatabaseTopologySnapshot();

        if (snapshot) {
          return res.json(snapshot);
        }
      } catch (databaseError) {
        console.error('[API] Auto topology fallback failed:', databaseError.message);
      }
    }

    res.status(500).json({
      error: 'Failed to fetch topology',
      message:
        sourceMode === 'database' ? 'Database topology snapshot is not available' : error.message,
    });
  }
});

app.get('/api/paths', async (req, res) => {
  const src = String(req.query.src || '').trim();
  const dst = String(req.query.dst || '').trim();

  if (!src || !dst) {
    return res.status(400).json({
      error: 'Missing path parameters',
      message: 'Both src and dst query parameters are required',
    });
  }

  try {
    const pathEntries = await fetchOnosPathsRaw(src, dst);

    const paths = pathEntries.map((pathEntry, index) => {
      const links = normalizeArrayPayload(pathEntry, ['links']);
      const nodes = [src];
      const edgeRefs = [];

      for (const link of links) {
        const sourceDevice = String(link?.src?.device || link?.src?.elementId || '');
        const targetDevice = String(link?.dst?.device || link?.dst?.elementId || '');
        const sourcePort = link?.src?.port ? String(link.src.port) : null;
        const targetPort = link?.dst?.port ? String(link.dst.port) : null;

        if (sourceDevice && nodes[nodes.length - 1] !== sourceDevice) {
          nodes.push(sourceDevice);
        }

        if (targetDevice && nodes[nodes.length - 1] !== targetDevice) {
          nodes.push(targetDevice);
        }

        if (sourceDevice && targetDevice) {
          edgeRefs.push(buildTopologyEdgeId(sourceDevice, targetDevice, sourcePort, targetPort));
        }
      }

      if (nodes[nodes.length - 1] !== dst) {
        nodes.push(dst);
      }

      const cost = toFiniteNumberOrNull(pathEntry?.cost);
      const hops = links.length;

      return {
        id: `path-${index + 1}`,
        cost,
        hops,
        summary: cost !== null ? `${hops} hops - cost ${cost}` : `${hops} hops`,
        nodes,
        edgeRefs,
      };
    });

    return res.json({
      source: 'onos',
      src,
      dst,
      total: paths.length,
      paths,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to compute ONOS paths',
      message: error.message,
    });
  }
});

app.get('/api/flows', async (_req, res) => {
  const databaseConnected = await refreshDatabaseStatus();

  if (databaseConnected) {
    try {
      const result = await pool.query(
        'SELECT * FROM flows ORDER BY last_updated DESC, flow_id ASC LIMIT 100'
      );

      if (result.rows.length > 0) {
        return res.json({
          total: result.rows.length,
          source: 'database',
          flows: result.rows.map((row) => ({
            id: row.flow_id,
            flowId: row.flow_id,
            deviceId: row.device_id,
            appId: row.app_id,
            priority: toNumber(row.priority),
            tableId: toNumber(row.table_id),
            state: row.state,
            selector: row.selector,
            treatment: row.treatment,
          })),
        });
      }
    } catch (error) {
      console.error('[API] Database flows fallback:', error.message);
    }
  }

  try {
    const flows = await fetchOnosFlowsRaw();
    res.json({
      total: flows.length,
      source: 'onos',
      flows: flows.map(formatOnosFlow),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch flows',
      message: error.message,
    });
  }
});

app.post('/api/flows/:deviceId', async (req, res) => {
  try {
    const appId = String(req.query.appId || req.body?.appId || 'org.platformsdn.app');
    const response = await onos.post(`/flows/${req.params.deviceId}`, req.body, {
      params: { appId },
    });
    void syncFlows();

    res.status(201).json({
      success: true,
      message: 'Flow created successfully',
      flow: response.data,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create flow',
      message: error.message,
    });
  }
});

app.delete('/api/flows/:deviceId/:flowId', async (req, res) => {
  const { deviceId, flowId } = req.params;

  try {
    await onos.delete(`/flows/${deviceId}/${flowId}`);

    if (await refreshDatabaseStatus()) {
      try {
        await pool.query('DELETE FROM flows WHERE flow_id = $1', [flowId]);
      } catch (error) {
        console.error('[API] Failed to remove flow from database cache:', error.message);
      }
    }

    res.json({
      success: true,
      message: 'Flow deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete flow',
      message: error.message,
    });
  }
});

app.get('/api/alerts', async (req, res) => {
  const statusFilter = String(req.query.status || 'all').toLowerCase();
  const severityFilter = String(req.query.severity || 'all').toLowerCase();
  const limit = Math.max(
    1,
    Math.min(500, Number.parseInt(String(req.query.limit || '200'), 10) || 200)
  );

  try {
    const snapshot = await syncDerivedAlerts();
    let alerts = snapshot.alerts;

    if (statusFilter === 'open') {
      alerts = alerts.filter((alert) => !alert.resolved);
    } else if (statusFilter === 'resolved') {
      alerts = alerts.filter((alert) => alert.resolved);
    }

    if (severityFilter !== 'all') {
      alerts = alerts.filter((alert) => alert.severity === severityFilter);
    }

    res.json({
      source: snapshot.source,
      total: alerts.length,
      summary: summarizeAlerts(snapshot.alerts),
      alerts: alerts.slice(0, limit),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch alerts',
      message: error.message,
    });
  }
});

app.post('/api/alerts/:id/resolve', requireRole('admin', 'operator'), async (req, res) => {
  if (!(await refreshDatabaseStatus())) {
    const localStore = readLocalStore();
    const targetAlert = localStore.alerts.find(
      (alert) => String(alert.id) === String(req.params.id)
    );

    if (!targetAlert) {
      return res.status(404).json({
        error: 'Alert not found',
        message: 'No alert exists with this identifier',
      });
    }

    targetAlert.resolved = true;
    targetAlert.resolved_at = targetAlert.resolved_at || new Date().toISOString();
    writeLocalStore(localStore);

    return res.json({
      message: 'Alert resolved successfully',
      alert: formatAlertRow(targetAlert),
      degradedMode: true,
    });
  }

  try {
    const result = await pool.query(
      `UPDATE alerts
       SET resolved = true,
           resolved_at = COALESCE(resolved_at, NOW())
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Alert not found',
        message: 'No alert exists with this identifier',
      });
    }

    return res.json({
      message: 'Alert resolved successfully',
      alert: formatAlertRow(result.rows[0]),
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to resolve alert',
      message: error.message,
    });
  }
});

app.get('/api/dashboard/overview', async (_req, res) => {
  try {
    const [
      systemData,
      clusterNodes,
      applications,
      hosts,
      intentsSummary,
      devices,
      metricsEntries,
      vplsItems,
    ] = await Promise.all([
      fetchOnosSystemRaw().catch(() => ({})),
      fetchOnosClusterRaw().catch(() => []),
      fetchOnosApplicationsRaw().catch(() => []),
      fetchOnosHostsRaw().catch(() => []),
      fetchOnosIntentMiniSummaryRaw().catch(() => ({})),
      fetchOnosDevicesRaw().catch(() => []),
      fetchOnosMetricsRaw().catch(() => []),
      fetchOnosVplsRaw().catch(() => []),
    ]);

    const mastership = await buildMastershipSnapshot(devices, clusterNodes).catch(() => ({
      totalDevices: devices.length,
      sampledDevices: 0,
      resolvedDevices: 0,
      unresolvedDevices: 0,
      leaders: [],
      devices: [],
    }));
    const observability = buildMetricsSnapshot(metricsEntries);
    const vpls = buildVplsSnapshot(vplsItems);

    const applicationItems = await Promise.all(
      applications.slice(0, 8).map(async (application) => {
        const name = application.name || application.id || 'unknown';
        let health = null;

        try {
          health = await fetchOnosApplicationHealthRaw(name);
        } catch {
          health = null;
        }

        return {
          name,
          state: application.state || application.status || 'unknown',
          version: application.version || null,
          health,
        };
      })
    );

    const overview = {
      source: 'onos',
      controller: {
        version: systemData.version || systemData.onosVersion || 'Unknown',
        build: systemData.build || systemData.buildNumber || null,
        uptime:
          systemData.uptime !== undefined && systemData.uptime !== null
            ? String(systemData.uptime)
            : systemData.upTime !== undefined && systemData.upTime !== null
              ? String(systemData.upTime)
              : null,
        system: extractControllerRuntime(systemData),
      },
      cluster: {
        total: clusterNodes.length,
        online: clusterNodes.filter(isClusterNodeOnline).length,
        nodes: clusterNodes.map((node) => ({
          id: node.id || node.nodeId || node.ip || 'unknown',
          ip: node.ip || node.address || null,
          state: node.state || node.status || 'unknown',
        })),
      },
      applications: {
        total: applications.length,
        active: applications.filter(isApplicationActive).length,
        items: applicationItems,
      },
      hosts: {
        total: hosts.length,
      },
      intents: {
        summary: intentsSummary,
      },
      mastership,
      observability,
      vpls,
    };

    return res.json(overview);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch dashboard overview',
      message: error.message,
    });
  }
});

app.get('/api/dashboard/link-load', async (_req, res) => {
  try {
    const entries = await fetchOnosLinkLoadRaw();

    const normalized = entries.map((entry, index) => {
      const device =
        entry.device || entry.deviceId || entry.src || entry.source || entry.elementId || 'unknown';
      const port = entry.port || entry.portNumber || entry.srcPort || entry.sourcePort || '?';
      const utilization =
        entry.utilization ??
        entry.load ??
        entry.rate ??
        entry.linkLoad ??
        entry.latest ??
        entry.value ??
        null;

      return {
        id: entry.id || `${device}-${port}-${index}`,
        device: String(device),
        port: String(port),
        utilization: typeof utilization === 'number' ? utilization : Number(utilization) || null,
        raw: entry,
      };
    });

    return res.json({
      source: 'onos',
      total: normalized.length,
      links: normalized,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch link load telemetry',
      message: error.message,
    });
  }
});

app.get('/api/services/vpls', async (_req, res) => {
  try {
    const items = await fetchOnosVplsRaw();

    return res.json({
      source: 'onos',
      total: items.length,
      vpls: items,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch VPLS services',
      message: error.message,
    });
  }
});

app.post('/api/services/vpls', requireRole('admin', 'operator'), async (req, res) => {
  try {
    const response = await onosVpls.post('', req.body);

    return res.status(201).json({
      message: 'VPLS service created successfully',
      result: response.data,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to create VPLS service',
      message: error.message,
    });
  }
});

app.delete('/api/services/vpls/:name', requireRole('admin', 'operator'), async (req, res) => {
  try {
    await onosVpls.delete(`/${encodeURIComponent(req.params.name)}`);

    return res.json({
      message: 'VPLS service deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to delete VPLS service',
      message: error.message,
    });
  }
});

app.post(
  '/api/services/vpls/:name/interfaces',
  requireRole('admin', 'operator'),
  async (req, res) => {
    try {
      const response = await onosVpls.post(
        `/interfaces/${encodeURIComponent(req.params.name)}`,
        req.body
      );

      return res.status(201).json({
        message: 'VPLS interface added successfully',
        result: response.data,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to add VPLS interface',
        message: error.message,
      });
    }
  }
);

app.delete(
  '/api/services/vpls/:name/interfaces/:interfaceName',
  requireRole('admin', 'operator'),
  async (req, res) => {
    try {
      await onosVpls.delete(
        `/interface/${encodeURIComponent(req.params.name)}/${encodeURIComponent(req.params.interfaceName)}`
      );

      return res.json({
        message: 'VPLS interface deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to delete VPLS interface',
        message: error.message,
      });
    }
  }
);

app.get('/api/dashboard/stats', async (_req, res) => {
  try {
    await syncDerivedAlerts();
  } catch (error) {
    console.error('[API] Failed to refresh alerts for dashboard stats:', error.message);
  }

  const databaseConnected = await refreshDatabaseStatus();

  if (databaseConnected) {
    try {
      const stats = await pool.query(
        `SELECT
           (SELECT COUNT(*) FROM devices) AS total_devices,
           (SELECT COUNT(*) FROM devices WHERE available = true) AS online_devices,
           (SELECT COUNT(*) FROM devices WHERE available = false) AS offline_devices,
           (SELECT COUNT(*) FROM ports) AS total_ports,
           (SELECT COUNT(*) FROM ports WHERE live = true) AS live_ports,
           (SELECT COUNT(*) FROM ports WHERE enabled = true) AS enabled_ports,
           (SELECT COUNT(*) FROM flows) AS total_flows,
           (SELECT COUNT(*) FROM alerts WHERE resolved = false) AS active_alerts,
           (SELECT COUNT(*) FROM topology_links WHERE UPPER(state) = 'ACTIVE') AS active_links`
      );

      if (stats.rows.length > 0) {
        const row = stats.rows[0];
        const normalizedStats = {
          total_devices: toNumber(row.total_devices),
          online_devices: toNumber(row.online_devices),
          offline_devices: toNumber(row.offline_devices),
          total_ports: toNumber(row.total_ports),
          live_ports: toNumber(row.live_ports),
          enabled_ports: toNumber(row.enabled_ports),
          total_flows: toNumber(row.total_flows),
          active_alerts: toNumber(row.active_alerts),
          active_links: toNumber(row.active_links),
        };

        const hasNetworkInventory =
          normalizedStats.total_devices > 0 ||
          normalizedStats.total_ports > 0 ||
          normalizedStats.total_flows > 0;

        if (hasNetworkInventory || databaseMode !== 'embedded-pgmem') {
          return res.json({
            timestamp: new Date().toISOString(),
            source: 'database',
            stats: normalizedStats,
          });
        }
      }
    } catch (error) {
      console.error('[API] Database dashboard stats fallback:', error.message);
    }
  }

  try {
    const stats = await getLiveDashboardStats();
    res.json({
      timestamp: new Date().toISOString(),
      source: 'onos',
      stats,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch dashboard stats',
      message: error.message,
    });
  }
});

app.get('/api/metrics/devices', async (_req, res) => {
  const databaseConnected = await refreshDatabaseStatus();

  if (databaseConnected) {
    try {
      const result = await pool.query(
        `SELECT
           d.device_id,
           d.type,
           d.available,
           COUNT(CASE WHEN p.live = true THEN 1 END) AS live_ports,
           COUNT(CASE WHEN p.enabled = true THEN 1 END) AS enabled_ports,
           COUNT(p.id) AS total_ports,
           COALESCE(SUM(p.rx_bytes), 0) AS total_rx_bytes,
           COALESCE(SUM(p.tx_bytes), 0) AS total_tx_bytes,
           d.last_updated
         FROM devices d
         LEFT JOIN ports p ON d.device_id = p.device_id
         GROUP BY d.device_id, d.type, d.available, d.last_updated
         ORDER BY d.last_updated DESC, d.device_id ASC`
      );

      if (result.rows.length > 0) {
        return res.json({
          source: 'database',
          metrics: result.rows.map((row) => ({
            ...row,
            live_ports: toNumber(row.live_ports),
            enabled_ports: toNumber(row.enabled_ports),
            total_ports: toNumber(row.total_ports),
            total_rx_bytes: toNumber(row.total_rx_bytes),
            total_tx_bytes: toNumber(row.total_tx_bytes),
          })),
        });
      }
    } catch (error) {
      console.error('[API] Database device metrics fallback:', error.message);
    }
  }

  try {
    const metrics = await getLiveDeviceMetrics();
    res.json({
      source: 'onos',
      metrics,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch metrics',
      message: error.message,
    });
  }
});

app.get('/api/metrics/port-history/:deviceId/:port', async (req, res) => {
  const { deviceId, port } = req.params;
  const limit = Number.parseInt(String(req.query.limit || '100'), 10);
  const databaseConnected = await refreshDatabaseStatus();

  if (databaseConnected) {
    try {
      const result = await pool.query(
        `SELECT timestamp, rx_bytes, tx_bytes, rx_packets, tx_packets
         FROM port_metrics
         WHERE device_id = $1 AND port_number = $2
         ORDER BY timestamp DESC
         LIMIT $3`,
        [deviceId, port, limit]
      );

      if (result.rows.length > 0) {
        return res.json({
          deviceId,
          port,
          source: 'database',
          history: result.rows.reverse().map((row) => ({
            ...row,
            rx_bytes: toNumber(row.rx_bytes),
            tx_bytes: toNumber(row.tx_bytes),
            rx_packets: toNumber(row.rx_packets),
            tx_packets: toNumber(row.tx_packets),
          })),
        });
      }
    } catch (error) {
      console.error('[API] Database port history fallback:', error.message);
    }
  }

  try {
    const ports = await fetchOnosPortsRaw(deviceId);
    const currentPort = ports.find((entry) => String(entry.portNumber) === String(port));

    res.json({
      deviceId,
      port,
      source: 'onos',
      history: currentPort
        ? [
            {
              timestamp: new Date().toISOString(),
              rx_bytes: currentPort.statistics?.rxBytes || 0,
              tx_bytes: currentPort.statistics?.txBytes || 0,
              rx_packets: currentPort.statistics?.rxPackets || 0,
              tx_packets: currentPort.statistics?.txPackets || 0,
            },
          ]
        : [],
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch port history',
      message: error.message,
    });
  }
});

// ============================================
// NEW: Cluster Health Endpoint
// ============================================
app.get('/api/cluster/health', async (_req, res) => {
  try {
    const clusterInfo = await axios.get(`${ONOS_URL}/cluster`, {
      auth: { username: ONOS_USER, password: ONOS_PASSWORD },
    });

    const nodes = clusterInfo.data.nodes || [];
    const onlineNodes = nodes.filter((n) => n.status === 'ACTIVE').length;

    res.json({
      source: 'onos',
      timestamp: new Date().toISOString(),
      cluster: {
        totalNodes: nodes.length,
        onlineNodes,
        offlineNodes: nodes.length - onlineNodes,
        masterNode: clusterInfo.data.onos || null,
        nodes: nodes.map((n) => ({
          id: n.id,
          ip: n.ip,
          status: n.status,
          lastUpdated: n.lastUpdated,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch cluster health',
      message: error.message,
    });
  }
});

// ============================================
// NEW: ONOS Applications Endpoint
// ============================================
app.get('/api/onos/applications', async (_req, res) => {
  try {
    const appsInfo = await axios.get(`${ONOS_URL}/applications`, {
      auth: { username: ONOS_USER, password: ONOS_PASSWORD },
    });

    const apps = appsInfo.data.applications || [];
    const activeApps = apps.filter((a) => a.state === 'ACTIVE');

    res.json({
      source: 'onos',
      timestamp: new Date().toISOString(),
      summary: {
        total: apps.length,
        active: activeApps.length,
        inactive: apps.length - activeApps.length,
      },
      applications: apps.map((a) => ({
        id: a.id,
        name: a.name || a.id,
        state: a.state,
        category: a.category || 'other',
        version: a.version || 'unknown',
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch applications',
      message: error.message,
    });
  }
});

// ============================================
// NEW: ONOS Intents Endpoint
// ============================================
app.get('/api/onos/intents', async (_req, res) => {
  try {
    const intentsInfo = await axios.get(`${ONOS_URL}/intents`, {
      auth: { username: ONOS_USER, password: ONOS_PASSWORD },
    });

    const intents = intentsInfo.data.intents || [];
    const installedIntents = intents.filter((i) => i.state === 'INSTALLED');
    const failedIntents = intents.filter((i) => i.state === 'FAILED');

    res.json({
      source: 'onos',
      timestamp: new Date().toISOString(),
      summary: {
        total: intents.length,
        installed: installedIntents.length,
        failed: failedIntents.length,
        other: intents.length - installedIntents.length - failedIntents.length,
      },
      intents: intents.slice(0, 20).map((i) => ({
        id: i.id,
        type: i.type || 'point-to-point',
        state: i.state,
        appId: i.appId,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch intents',
      message: error.message,
    });
  }
});

// ============================================
// NEW: Network Performance Endpoint
// ============================================
app.get('/api/network/performance', async (_req, res) => {
  try {
    const statsInfo = await axios.get(`${ONOS_URL}/statistics/ports`, {
      auth: { username: ONOS_USER, password: ONOS_PASSWORD },
    });

    const statsList = statsInfo.data.statistics || [];

    // Calculate metrics
    let totalRxBytes = 0;
    let totalTxBytes = 0;
    let totalRxPackets = 0;
    let totalTxPackets = 0;
    let linkCount = 0;

    statsList.forEach((stat) => {
      totalRxBytes += parseInt(stat.bytes_rcvd) || 0;
      totalTxBytes += parseInt(stat.bytes_sent) || 0;
      totalRxPackets += parseInt(stat.packets_rcvd) || 0;
      totalTxPackets += parseInt(stat.packets_sent) || 0;
      if (stat.port_speed > 0) linkCount++;
    });

    const avgLinkUsage =
      linkCount > 0 ? ((totalRxBytes + totalTxBytes) / (linkCount * 1e9)) * 100 : 0;

    res.json({
      source: 'onos',
      timestamp: new Date().toISOString(),
      summary: {
        totalRxBytes,
        totalTxBytes,
        totalRxPackets,
        totalTxPackets,
        linkCount,
      },
      throughput: {
        rxBytesPerSec: totalRxBytes / 15, // approximate per 15s
        txBytesPerSec: totalTxBytes / 15,
      },
      utilization: {
        average: Math.min(100, Math.round(avgLinkUsage)),
        min: 0,
        max: 100,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch network performance',
      message: error.message,
    });
  }
});

// ============================================
// NEW: Network Traffic Heatmap Endpoint
// ============================================
app.get('/api/network/heatmap', async (_req, res) => {
  try {
    const statsInfo = await axios.get(`${ONOS_URL}/statistics/ports`, {
      auth: { username: ONOS_USER, password: ONOS_PASSWORD },
    });

    const statsList = statsInfo.data.statistics || [];

    // Sort by throughput and get top 10
    const linkStats = statsList
      .map((stat) => ({
        deviceId: stat.device_id,
        port: stat.port_id,
        speed: stat.port_speed || 0,
        rxBytes: parseInt(stat.bytes_rcvd) || 0,
        txBytes: parseInt(stat.bytes_sent) || 0,
        throughput: (parseInt(stat.bytes_rcvd) || 0) + (parseInt(stat.bytes_sent) || 0),
      }))
      .sort((a, b) => b.throughput - a.throughput)
      .slice(0, 10);

    const topLinks = linkStats.map((link) => ({
      id: `${link.deviceId}:${link.port}`,
      link: `${link.deviceId.slice(-4)}:${link.port}`,
      throughput: link.throughput,
      utilization: link.speed > 0 ? Math.round((link.throughput / (link.speed * 1e6)) * 100) : 0,
    }));

    res.json({
      source: 'onos',
      timestamp: new Date().toISOString(),
      topLinks,
      totalLinks: statsList.length,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch network heatmap',
      message: error.message,
    });
  }
});

app.use((error, _req, res, _next) => {
  console.error('[API] Unhandled error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal Server Error',
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  const databaseConnected = await refreshDatabaseStatus();

  if (databaseConnected) {
    databaseMode = 'postgresql';
    console.log('[DB] PostgreSQL connection ready');
    await ensureAuthSchema();
  } else {
    console.warn('[DB] PostgreSQL unavailable at startup:', lastDatabaseError);
    try {
      await enableEmbeddedDatabase();
      console.log('[DB] Embedded pg-mem database initialized');
      await ensureAuthSchema();
    } catch (error) {
      console.error('[DB] Embedded database initialization failed:', error.message);
      writeLocalStore(readLocalStore());
      console.log(`[LOCAL-STORE] Using ${LOCAL_STORE_PATH} for auth and alerts persistence`);
    }
  }

  app.listen(PORT, () => {
    console.log(`[OK] SDN Platform backend running on port ${PORT}`);
    console.log(`[ONOS] Controller: ${ONOS_URL}`);
    console.log(`[API] Base: http://localhost:${PORT}/api`);
    console.log(`[DB] Mode: ${databaseMode}`);
    console.log(`[AUTH] Default admin: ${DEFAULT_ADMIN_USER.email}`);
    startAutoSync();
  });
}

function shutdown() {
  console.log('[SYS] Shutting down backend...');

  if (syncTimer) {
    clearInterval(syncTimer);
  }

  pool
    .end()
    .catch((error) => {
      console.error('[DB] Error while closing pool:', error.message);
    })
    .finally(() => {
      process.exit(0);
    });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer().catch((error) => {
  console.error('[SYS] Backend failed to start:', error.message);
  process.exit(1);
});
