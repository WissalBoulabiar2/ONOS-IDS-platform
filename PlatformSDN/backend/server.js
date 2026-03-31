const express = require('express')
const cors = require('cors')
const axios = require('axios')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Configuration ONOS
const ONOS_CONFIG = {
  host: process.env.ONOS_HOST || 'localhost',
  port: process.env.ONOS_PORT || 8181,
  user: process.env.ONOS_USER || 'karaf',
  password: process.env.ONOS_PASSWORD || 'karaf'
}

// Base URL ONOS API
const ONOS_URL = `http://${ONOS_CONFIG.host}:${ONOS_CONFIG.port}`
const ONOS_API = `${ONOS_URL}/onos/v1`

// Axios instance avec authentification
const onos = axios.create({
  baseURL: ONOS_API,
  auth: {
    username: ONOS_CONFIG.user,
    password: ONOS_CONFIG.password
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SDN Platform Backend is running' })
})

// DEVICES ENDPOINT
app.get('/api/devices', async (req, res) => {
  try {
    const response = await onos.get('/devices')
    const devices = response.data.devices || []

    // Format la réponse
    const formattedDevices = devices.map(device => ({
      id: device.id,
      type: device.type,
      available: device.available,
      manufacturer: device.mfr || 'Unknown',
      serialNumber: device.serialNumber || 'N/A',
      port: device.chassisId || 'N/A'
    }))

    res.json({
      total: devices.length,
      devices: formattedDevices
    })
  } catch (error) {
    console.error('Error fetching devices:', error.message)
    res.status(500).json({
      error: 'Failed to fetch devices',
      message: error.message
    })
  }
})

// TOPOLOGY ENDPOINT
app.get('/api/topology', async (req, res) => {
  try {
    const devicesRes = await onos.get('/devices')
    const topologyRes = await onos.get('/topology')
    const linksRes = await onos.get('/links')

    const devices = devicesRes.data.devices || []
    const clusters = topologyRes.data.clusters || []
    const links = linksRes.data.links || []

    // Format nodes
    const nodes = devices.map(device => ({
      id: device.id,
      label: device.id.split(':')[1] || device.id,
      type: device.type,
      available: device.available,
      data: device
    }))

    // Format edges (links)
    const edges = links.map(link => ({
      id: `${link.src.device}-${link.dest.device}`,
      source: link.src.device,
      target: link.dest.device,
      data: link
    }))

    res.json({
      nodes,
      edges,
      clustering: clusters
    })
  } catch (error) {
    console.error('Error fetching topology:', error.message)
    res.status(500).json({
      error: 'Failed to fetch topology',
      message: error.message
    })
  }
})

// FLOWS ENDPOINT
app.get('/api/flows', async (req, res) => {
  try {
    const response = await onos.get('/flows')
    const flows = response.data.flows || []

    const formattedFlows = flows.map(flow => ({
      id: flow.id,
      deviceId: flow.deviceId,
      appId: flow.appId,
      priority: flow.priority,
      tableId: flow.tableId,
      state: flow.state,
      selector: flow.selector,
      treatment: flow.treatment
    }))

    res.json({
      total: flows.length,
      flows: formattedFlows
    })
  } catch (error) {
    console.error('Error fetching flows:', error.message)
    res.status(500).json({
      error: 'Failed to fetch flows',
      message: error.message
    })
  }
})

// POST NEW FLOW (Create flow rule)
app.post('/api/flows/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params
    const flowData = req.body

    const response = await onos.post(`/flows/${deviceId}`, flowData)

    res.status(201).json({
      success: true,
      message: 'Flow created successfully',
      flow: response.data
    })
  } catch (error) {
    console.error('Error creating flow:', error.message)
    res.status(500).json({
      error: 'Failed to create flow',
      message: error.message
    })
  }
})

// PORTS ENDPOINT
app.get('/api/devices/:deviceId/ports', async (req, res) => {
  try {
    const { deviceId } = req.params
    const response = await onos.get(`/devices/${deviceId}/ports`)
    const ports = response.data.ports || []

    res.json({
      deviceId,
      total: ports.length,
      ports: ports.map(port => ({
        portNumber: port.portNumber,
        portSpeed: port.portSpeed,
        enabled: port.isEnabled,
        live: port.isLive,
        rxBytes: port.statistics?.rxBytes || 0,
        txBytes: port.statistics?.txBytes || 0,
        rxPackets: port.statistics?.rxPackets || 0,
        txPackets: port.statistics?.txPackets || 0
      }))
    })
  } catch (error) {
    console.error('Error fetching ports:', error.message)
    res.status(500).json({
      error: 'Failed to fetch ports',
      message: error.message
    })
  }
})

// ERROR HANDLING
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  })
})

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// START SERVER
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`✅ SDN Platform Backend running on port ${PORT}`)
  console.log(`📡 ONOS Controller: ${ONOS_URL}`)
  console.log(`📍 API Base: http://localhost:${PORT}/api`)
})
