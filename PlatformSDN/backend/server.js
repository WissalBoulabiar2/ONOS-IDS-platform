const express = require("express")
const cors = require("cors")
const axios = require("axios")
const path = require("path")
const { Pool } = require("pg")

require("dotenv").config({ path: path.join(__dirname, ".env") })

const app = express()

app.use(cors())
app.use(express.json())

const ONOS_CONFIG = {
  host: process.env.ONOS_HOST || "localhost",
  port: process.env.ONOS_PORT || 8181,
  user: process.env.ONOS_USER || "karaf",
  password: process.env.ONOS_PASSWORD || "karaf",
}

const ONOS_URL = `http://${ONOS_CONFIG.host}:${ONOS_CONFIG.port}`
const ONOS_API = `${ONOS_URL}/onos/v1`
const AUTO_SYNC_ENABLED = process.env.ENABLE_AUTO_SYNC === "true"
const AUTO_SYNC_INTERVAL = Number.parseInt(process.env.SYNC_INTERVAL_MS || "5000", 10)

const pool = new Pool({
  user: process.env.DB_USER || "sdnuser",
  password: process.env.DB_PASSWORD || "sdnpass123",
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "sdn_platform",
})

const onos = axios.create({
  baseURL: ONOS_API,
  timeout: 8000,
  proxy: false,
  auth: {
    username: ONOS_CONFIG.user,
    password: ONOS_CONFIG.password,
  },
})

let isDatabaseReady = false
let lastDatabaseError = null
let syncTimer = null
let syncInProgress = false

pool.on("error", (error) => {
  isDatabaseReady = false
  lastDatabaseError = error.message
  console.error("[DB] Idle client error:", error.message)
})

function normalizeDeviceType(type) {
  const normalized = String(type || "switch").toLowerCase()
  return ["switch", "router", "host"].includes(normalized) ? normalized : "switch"
}

function toNumber(value) {
  if (typeof value === "number") {
    return value
  }

  const parsed = Number.parseInt(String(value ?? 0), 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

async function refreshDatabaseStatus() {
  try {
    await pool.query("SELECT 1")
    isDatabaseReady = true
    lastDatabaseError = null
    return true
  } catch (error) {
    isDatabaseReady = false
    lastDatabaseError = error.message
    return false
  }
}

async function safeSyncLog(syncType, status, recordsSynced = 0, errorMessage = null, syncDurationMs = 0) {
  if (!isDatabaseReady) {
    return
  }

  try {
    await pool.query(
      `INSERT INTO sync_log (sync_type, status, records_synced, error_message, sync_duration_ms, timestamp)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [syncType, status, recordsSynced, errorMessage, syncDurationMs]
    )
  } catch (error) {
    console.error("[DB] Failed to write sync log:", error.message)
  }
}

function formatDbDevice(row) {
  return {
    id: row.device_id,
    type: normalizeDeviceType(row.type),
    available: row.available,
    manufacturer: row.manufacturer || "Unknown",
    serialNumber: row.serial_number || "N/A",
    portCount: toNumber(row.port_count),
  }
}

function formatOnosDevice(device) {
  return {
    id: device.id,
    type: normalizeDeviceType(device.type),
    available: device.available !== false,
    manufacturer: device.mfr || "Unknown",
    serialNumber: device.serialNumber || "N/A",
  }
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
  }
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
  }
}

async function fetchOnosDevicesRaw() {
  const response = await onos.get("/devices")
  return response.data.devices || []
}

async function fetchOnosPortsRaw(deviceId) {
  const response = await onos.get(`/devices/${deviceId}/ports`)
  return response.data.ports || []
}

async function fetchOnosLinksRaw() {
  const response = await onos.get("/links")
  return response.data.links || []
}

async function fetchOnosFlowsRaw() {
  const response = await onos.get("/flows")
  return response.data.flows || []
}

async function checkOnosHealth() {
  try {
    await onos.get("/devices")
    return { connected: true, error: null }
  } catch (error) {
    return { connected: false, error: error.message }
  }
}

async function syncDevices() {
  if (!(await refreshDatabaseStatus())) {
    return { synced: 0, skipped: true, error: lastDatabaseError }
  }

  const startedAt = Date.now()

  try {
    const devices = await fetchOnosDevicesRaw()

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
          device.mfr || "Unknown",
          device.serialNumber || "N/A",
          0,
        ]
      )
    }

    await safeSyncLog("devices", "success", devices.length, null, Date.now() - startedAt)
    return { synced: devices.length }
  } catch (error) {
    console.error("[SYNC] Device sync error:", error.message)
    await safeSyncLog("devices", "error", 0, error.message, Date.now() - startedAt)
    return { synced: 0, error: error.message }
  }
}

async function syncPorts() {
  if (!(await refreshDatabaseStatus())) {
    return { synced: 0, skipped: true, error: lastDatabaseError }
  }

  const startedAt = Date.now()
  let totalPorts = 0

  try {
    const devices = await fetchOnosDevicesRaw()

    for (const device of devices) {
      try {
        const ports = await fetchOnosPortsRaw(device.id)

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
          )

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
          )

          totalPorts += 1
        }

        await pool.query(
          "UPDATE devices SET port_count = $1, last_updated = NOW() WHERE device_id = $2",
          [ports.length, device.id]
        )
      } catch (error) {
        console.error(`[SYNC] Port sync error for ${device.id}:`, error.message)
      }
    }

    await safeSyncLog("ports", "success", totalPorts, null, Date.now() - startedAt)
    return { synced: totalPorts }
  } catch (error) {
    console.error("[SYNC] Port sync error:", error.message)
    await safeSyncLog("ports", "error", 0, error.message, Date.now() - startedAt)
    return { synced: 0, error: error.message }
  }
}

async function syncTopology() {
  if (!(await refreshDatabaseStatus())) {
    return { synced: 0, skipped: true, error: lastDatabaseError }
  }

  const startedAt = Date.now()

  try {
    const links = await fetchOnosLinksRaw()

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
          link.type || "DIRECT",
          link.state || "ACTIVE",
        ]
      )
    }

    await safeSyncLog("topology", "success", links.length, null, Date.now() - startedAt)
    return { synced: links.length }
  } catch (error) {
    console.error("[SYNC] Topology sync error:", error.message)
    await safeSyncLog("topology", "error", 0, error.message, Date.now() - startedAt)
    return { synced: 0, error: error.message }
  }
}

async function syncFlows() {
  if (!(await refreshDatabaseStatus())) {
    return { synced: 0, skipped: true, error: lastDatabaseError }
  }

  const startedAt = Date.now()

  try {
    const flows = await fetchOnosFlowsRaw()

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
          flow.appId || "unknown",
          flow.priority || 0,
          flow.tableId || 0,
          flow.state || "PENDING_ADD",
          JSON.stringify(flow.selector || {}),
          JSON.stringify(flow.treatment || {}),
        ]
      )
    }

    await safeSyncLog("flows", "success", flows.length, null, Date.now() - startedAt)
    return { synced: flows.length }
  } catch (error) {
    console.error("[SYNC] Flow sync error:", error.message)
    await safeSyncLog("flows", "error", 0, error.message, Date.now() - startedAt)
    return { synced: 0, error: error.message }
  }
}

async function performFullSync() {
  if (syncInProgress) {
    console.warn("[SYNC] Previous sync cycle still running, skipping this interval.")
    return
  }

  if (!AUTO_SYNC_ENABLED) {
    return
  }

  if (!(await refreshDatabaseStatus())) {
    console.warn("[SYNC] Database unavailable, sync skipped:", lastDatabaseError)
    return
  }

  syncInProgress = true
  console.log(`[SYNC] Starting cycle at ${new Date().toISOString()}`)

  try {
    await syncDevices()
    await syncPorts()
    await syncTopology()
    await syncFlows()
    console.log("[SYNC] Cycle completed")
  } finally {
    syncInProgress = false
  }
}

function startAutoSync() {
  if (!AUTO_SYNC_ENABLED) {
    console.log("[SYNC] Auto-sync disabled")
    return
  }

  console.log(`[SYNC] Auto-sync enabled every ${AUTO_SYNC_INTERVAL}ms`)
  void performFullSync()
  syncTimer = setInterval(() => {
    void performFullSync()
  }, AUTO_SYNC_INTERVAL)
}

async function getLiveDashboardStats() {
  const devices = await fetchOnosDevicesRaw()
  const links = await fetchOnosLinksRaw()
  const flows = await fetchOnosFlowsRaw()
  const portGroups = await Promise.all(
    devices.map(async (device) => {
      try {
        return await fetchOnosPortsRaw(device.id)
      } catch {
        return []
      }
    })
  )

  const allPorts = portGroups.flat()

  return {
    total_devices: devices.length,
    online_devices: devices.filter((device) => device.available !== false).length,
    offline_devices: devices.filter((device) => device.available === false).length,
    total_ports: allPorts.length,
    live_ports: allPorts.filter((port) => port.isLive).length,
    enabled_ports: allPorts.filter((port) => port.isEnabled).length,
    total_flows: flows.length,
    active_alerts: 0,
    active_links: links.filter((link) => String(link.state || "ACTIVE").toUpperCase() === "ACTIVE").length,
  }
}

async function getLiveDeviceMetrics() {
  const devices = await fetchOnosDevicesRaw()

  return Promise.all(
    devices.map(async (device) => {
      let ports = []

      try {
        ports = await fetchOnosPortsRaw(device.id)
      } catch {
        ports = []
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
      }
    })
  )
}

app.get("/api/health", async (_req, res) => {
  const onosStatus = await checkOnosHealth()
  const databaseConnected = await refreshDatabaseStatus()
  const degraded = onosStatus.connected && AUTO_SYNC_ENABLED && !databaseConnected
  const status = onosStatus.connected ? (degraded ? "DEGRADED" : "OK") : "ERROR"

  res.status(onosStatus.connected ? 200 : 503).json({
    status,
    message: onosStatus.connected
      ? "SDN Platform backend is reachable"
      : "ONOS controller is unreachable",
    timestamp: new Date().toISOString(),
    onos: {
      url: ONOS_URL,
      connected: onosStatus.connected,
      error: onosStatus.error,
    },
    database: {
      connected: databaseConnected,
      error: lastDatabaseError,
    },
    sync: {
      enabled: AUTO_SYNC_ENABLED,
      intervalMs: AUTO_SYNC_INTERVAL,
      inProgress: syncInProgress,
    },
  })
})

app.get("/api/devices", async (_req, res) => {
  const databaseConnected = await refreshDatabaseStatus()

  if (databaseConnected) {
    try {
      const result = await pool.query(
        "SELECT * FROM devices ORDER BY last_updated DESC, device_id ASC"
      )

      if (result.rows.length > 0) {
        return res.json({
          total: result.rows.length,
          source: "database",
          devices: result.rows.map(formatDbDevice),
        })
      }
    } catch (error) {
      console.error("[API] Database devices fallback:", error.message)
    }
  }

  try {
    const devices = await fetchOnosDevicesRaw()
    res.json({
      total: devices.length,
      source: "onos",
      devices: devices.map(formatOnosDevice),
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch devices",
      message: error.message,
    })
  }
})

app.get("/api/devices/:deviceId/ports", async (req, res) => {
  const { deviceId } = req.params
  const databaseConnected = await refreshDatabaseStatus()

  if (databaseConnected) {
    try {
      const result = await pool.query(
        "SELECT * FROM ports WHERE device_id = $1 ORDER BY port_number",
        [deviceId]
      )

      if (result.rows.length > 0) {
        return res.json({
          deviceId,
          total: result.rows.length,
          source: "database",
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
        })
      }
    } catch (error) {
      console.error("[API] Database ports fallback:", error.message)
    }
  }

  try {
    const ports = await fetchOnosPortsRaw(deviceId)
    res.json({
      deviceId,
      total: ports.length,
      source: "onos",
      ports: ports.map(formatOnosPort),
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch ports",
      message: error.message,
    })
  }
})

app.get("/api/topology", async (_req, res) => {
  const databaseConnected = await refreshDatabaseStatus()

  if (databaseConnected) {
    try {
      const devicesResult = await pool.query("SELECT * FROM devices ORDER BY device_id ASC")
      const linksResult = await pool.query(
        "SELECT * FROM topology_links ORDER BY last_updated DESC, source_device ASC"
      )

      if (devicesResult.rows.length > 0) {
        return res.json({
          source: "database",
          nodes: devicesResult.rows.map((row) => ({
            id: row.device_id,
            label: row.device_id.split(":")[1] || row.device_id,
            type: normalizeDeviceType(row.type),
            available: row.available,
            status: row.available ? "active" : "inactive",
          })),
          edges: linksResult.rows.map((row) => ({
            id: `${row.source_device}-${row.target_device}-${row.source_port || "na"}-${row.target_port || "na"}`,
            source: row.source_device,
            target: row.target_device,
            label: row.link_type || "",
            status: String(row.state || "ACTIVE").toLowerCase() === "active" ? "active" : "inactive",
          })),
        })
      }
    } catch (error) {
      console.error("[API] Database topology fallback:", error.message)
    }
  }

  try {
    const [devices, links] = await Promise.all([fetchOnosDevicesRaw(), fetchOnosLinksRaw()])

    res.json({
      source: "onos",
      nodes: devices.map((device) => ({
        id: device.id,
        label: device.id.split(":")[1] || device.id,
        type: normalizeDeviceType(device.type),
        available: device.available !== false,
        status: device.available !== false ? "active" : "inactive",
      })),
      edges: links.map((link) => ({
        id: `${link.src.device}-${link.dst.device}-${link.src.port || "na"}-${link.dst.port || "na"}`,
        source: link.src.device,
        target: link.dst.device,
        label: link.type || "",
        status: String(link.state || "ACTIVE").toLowerCase() === "active" ? "active" : "inactive",
      })),
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch topology",
      message: error.message,
    })
  }
})

app.get("/api/flows", async (_req, res) => {
  const databaseConnected = await refreshDatabaseStatus()

  if (databaseConnected) {
    try {
      const result = await pool.query(
        "SELECT * FROM flows ORDER BY last_updated DESC, flow_id ASC LIMIT 100"
      )

      if (result.rows.length > 0) {
        return res.json({
          total: result.rows.length,
          source: "database",
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
        })
      }
    } catch (error) {
      console.error("[API] Database flows fallback:", error.message)
    }
  }

  try {
    const flows = await fetchOnosFlowsRaw()
    res.json({
      total: flows.length,
      source: "onos",
      flows: flows.map(formatOnosFlow),
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch flows",
      message: error.message,
    })
  }
})

app.post("/api/flows/:deviceId", async (req, res) => {
  try {
    const response = await onos.post(`/flows/${req.params.deviceId}`, req.body)
    void syncFlows()

    res.status(201).json({
      success: true,
      message: "Flow created successfully",
      flow: response.data,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to create flow",
      message: error.message,
    })
  }
})

app.delete("/api/flows/:deviceId/:flowId", async (req, res) => {
  const { deviceId, flowId } = req.params

  try {
    await onos.delete(`/flows/${deviceId}/${flowId}`)

    if (await refreshDatabaseStatus()) {
      try {
        await pool.query("DELETE FROM flows WHERE flow_id = $1", [flowId])
      } catch (error) {
        console.error("[API] Failed to remove flow from database cache:", error.message)
      }
    }

    res.json({
      success: true,
      message: "Flow deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete flow",
      message: error.message,
    })
  }
})

app.get("/api/dashboard/stats", async (_req, res) => {
  const databaseConnected = await refreshDatabaseStatus()

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
      )

      if (stats.rows.length > 0) {
        const row = stats.rows[0]

        return res.json({
          timestamp: new Date().toISOString(),
          source: "database",
          stats: {
            total_devices: toNumber(row.total_devices),
            online_devices: toNumber(row.online_devices),
            offline_devices: toNumber(row.offline_devices),
            total_ports: toNumber(row.total_ports),
            live_ports: toNumber(row.live_ports),
            enabled_ports: toNumber(row.enabled_ports),
            total_flows: toNumber(row.total_flows),
            active_alerts: toNumber(row.active_alerts),
            active_links: toNumber(row.active_links),
          },
        })
      }
    } catch (error) {
      console.error("[API] Database dashboard stats fallback:", error.message)
    }
  }

  try {
    const stats = await getLiveDashboardStats()
    res.json({
      timestamp: new Date().toISOString(),
      source: "onos",
      stats,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch dashboard stats",
      message: error.message,
    })
  }
})

app.get("/api/metrics/devices", async (_req, res) => {
  const databaseConnected = await refreshDatabaseStatus()

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
      )

      if (result.rows.length > 0) {
        return res.json({
          source: "database",
          metrics: result.rows.map((row) => ({
            ...row,
            live_ports: toNumber(row.live_ports),
            enabled_ports: toNumber(row.enabled_ports),
            total_ports: toNumber(row.total_ports),
            total_rx_bytes: toNumber(row.total_rx_bytes),
            total_tx_bytes: toNumber(row.total_tx_bytes),
          })),
        })
      }
    } catch (error) {
      console.error("[API] Database device metrics fallback:", error.message)
    }
  }

  try {
    const metrics = await getLiveDeviceMetrics()
    res.json({
      source: "onos",
      metrics,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch metrics",
      message: error.message,
    })
  }
})

app.get("/api/metrics/port-history/:deviceId/:port", async (req, res) => {
  const { deviceId, port } = req.params
  const limit = Number.parseInt(String(req.query.limit || "100"), 10)
  const databaseConnected = await refreshDatabaseStatus()

  if (databaseConnected) {
    try {
      const result = await pool.query(
        `SELECT timestamp, rx_bytes, tx_bytes, rx_packets, tx_packets
         FROM port_metrics
         WHERE device_id = $1 AND port_number = $2
         ORDER BY timestamp DESC
         LIMIT $3`,
        [deviceId, port, limit]
      )

      if (result.rows.length > 0) {
        return res.json({
          deviceId,
          port,
          source: "database",
          history: result.rows.reverse().map((row) => ({
            ...row,
            rx_bytes: toNumber(row.rx_bytes),
            tx_bytes: toNumber(row.tx_bytes),
            rx_packets: toNumber(row.rx_packets),
            tx_packets: toNumber(row.tx_packets),
          })),
        })
      }
    } catch (error) {
      console.error("[API] Database port history fallback:", error.message)
    }
  }

  try {
    const ports = await fetchOnosPortsRaw(deviceId)
    const currentPort = ports.find((entry) => String(entry.portNumber) === String(port))

    res.json({
      deviceId,
      port,
      source: "onos",
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
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch port history",
      message: error.message,
    })
  }
})

app.use((error, _req, res, _next) => {
  console.error("[API] Unhandled error:", error)
  res.status(error.status || 500).json({
    error: error.message || "Internal Server Error",
  })
})

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" })
})

const PORT = process.env.PORT || 5000

async function startServer() {
  const databaseConnected = await refreshDatabaseStatus()

  if (databaseConnected) {
    console.log("[DB] PostgreSQL connection ready")
  } else {
    console.warn("[DB] PostgreSQL unavailable at startup:", lastDatabaseError)
  }

  app.listen(PORT, () => {
    console.log(`[OK] SDN Platform backend running on port ${PORT}`)
    console.log(`[ONOS] Controller: ${ONOS_URL}`)
    console.log(`[API] Base: http://localhost:${PORT}/api`)
    startAutoSync()
  })
}

function shutdown() {
  console.log("[SYS] Shutting down backend...")

  if (syncTimer) {
    clearInterval(syncTimer)
  }

  pool
    .end()
    .catch((error) => {
      console.error("[DB] Error while closing pool:", error.message)
    })
    .finally(() => {
      process.exit(0)
    })
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)

startServer().catch((error) => {
  console.error("[SYS] Backend failed to start:", error.message)
  process.exit(1)
})
