// Mock ONOS Data Generator for Testing

import {
  Device,
  Port,
  Link,
  FlowRule,
  Alert,
  TopologyNode,
  TopologyEdge,
  DashboardStats,
} from "./types"

const RECORDED_AT = new Date("2026-03-31T15:00:00Z")

// ============ DEVICES ============
export const mockDevices: Device[] = [
  {
    id: "of:0000000000000001",
    name: "Switch-Core-1",
    type: "switch",
    manufacturer: "ONF",
    hwVersion: "1.0",
    swVersion: "OpenFlow 1.3",
    status: "active",
    port_count: 48,
    latitude: 40.7128,
    longitude: -74.006,
    recordedAt: RECORDED_AT,
  },
  {
    id: "of:0000000000000002",
    name: "Switch-Core-2",
    type: "switch",
    manufacturer: "ONF",
    hwVersion: "1.0",
    swVersion: "OpenFlow 1.3",
    status: "active",
    port_count: 48,
    latitude: 40.7138,
    longitude: -74.016,
    recordedAt: RECORDED_AT,
  },
  {
    id: "of:0000000000000101",
    name: "Switch-Access-1",
    type: "switch",
    manufacturer: "ONF",
    hwVersion: "1.0",
    swVersion: "OpenFlow 1.3",
    status: "active",
    port_count: 24,
    latitude: 40.7118,
    longitude: -74.007,
    recordedAt: RECORDED_AT,
  },
  {
    id: "of:0000000000000102",
    name: "Switch-Access-2",
    type: "switch",
    manufacturer: "ONF",
    hwVersion: "1.0",
    swVersion: "OpenFlow 1.3",
    status: "inactive",
    port_count: 24,
    latitude: 40.7148,
    longitude: -74.015,
    recordedAt: RECORDED_AT,
  },
  {
    id: "of:0000000000000103",
    name: "Switch-Dist-1",
    type: "switch",
    manufacturer: "ONF",
    hwVersion: "1.0",
    swVersion: "OpenFlow 1.3",
    status: "active",
    port_count: 32,
    latitude: 40.7128,
    longitude: -74.026,
    recordedAt: RECORDED_AT,
  },
]

// ============ PORTS ============
export const mockPorts: Port[] = [
  {
    id: "port-1-1",
    deviceId: "of:0000000000000001",
    portNumber: 1,
    name: "eth0",
    status: "enabled",
    rxBytes: 1234567890,
    txBytes: 987654321,
    rxPackets: 5000000,
    txPackets: 4500000,
    recordedAt: RECORDED_AT,
  },
  {
    id: "port-1-2",
    deviceId: "of:0000000000000001",
    portNumber: 2,
    name: "eth1",
    status: "enabled",
    rxBytes: 2000000000,
    txBytes: 1500000000,
    rxPackets: 8000000,
    txPackets: 7000000,
    recordedAt: RECORDED_AT,
  },
  {
    id: "port-1-3",
    deviceId: "of:0000000000000001",
    portNumber: 3,
    name: "eth2",
    status: "enabled",
    rxBytes: 500000000,
    txBytes: 400000000,
    rxPackets: 2000000,
    txPackets: 1800000,
    recordedAt: RECORDED_AT,
  },
  {
    id: "port-2-1",
    deviceId: "of:0000000000000002",
    portNumber: 1,
    name: "eth0",
    status: "enabled",
    rxBytes: 1100000000,
    txBytes: 900000000,
    rxPackets: 4500000,
    txPackets: 4000000,
    recordedAt: RECORDED_AT,
  },
  {
    id: "port-101-1",
    deviceId: "of:0000000000000101",
    portNumber: 1,
    name: "eth0",
    status: "enabled",
    rxBytes: 300000000,
    txBytes: 250000000,
    rxPackets: 1000000,
    txPackets: 900000,
    recordedAt: RECORDED_AT,
  },
]

// ============ LINKS ============
export const mockLinks: Link[] = [
  {
    id: "link-1-2",
    srcDevice: "of:0000000000000001",
    srcPort: 1,
    dstDevice: "of:0000000000000002",
    dstPort: 1,
    status: "active",
    latency: 2.5,
    available_bandwidth: 10000000000,
    recordedAt: RECORDED_AT,
  },
  {
    id: "link-1-101",
    srcDevice: "of:0000000000000001",
    srcPort: 2,
    dstDevice: "of:0000000000000101",
    dstPort: 1,
    status: "active",
    latency: 1.2,
    available_bandwidth: 1000000000,
    recordedAt: RECORDED_AT,
  },
  {
    id: "link-1-103",
    srcDevice: "of:0000000000000001",
    srcPort: 3,
    dstDevice: "of:0000000000000103",
    dstPort: 1,
    status: "active",
    latency: 3.1,
    available_bandwidth: 1000000000,
    recordedAt: RECORDED_AT,
  },
  {
    id: "link-2-102",
    srcDevice: "of:0000000000000002",
    srcPort: 2,
    dstDevice: "of:0000000000000102",
    dstPort: 1,
    status: "inactive",
    latency: 5.0,
    available_bandwidth: 0,
    recordedAt: RECORDED_AT,
  },
]

// ============ FLOWS ============
export const mockFlows: FlowRule[] = [
  {
    id: "flow-1",
    flowId: "1",
    deviceId: "of:0000000000000001",
    priority: 100,
    match: {
      etherType: "0x0800",
      ipProtocol: "6",
      dstIp: "192.168.1.0/24",
    },
    action: { output: 1 },
    state: "added",
    appId: "org.onlab.app",
    duration: 3600,
    recordedAt: RECORDED_AT,
  },
  {
    id: "flow-2",
    flowId: "2",
    deviceId: "of:0000000000000001",
    priority: 50,
    match: {
      etherType: "0x0800",
      srcIp: "10.0.0.1",
    },
    action: { output: 2 },
    state: "added",
    appId: "org.onlab.app",
    duration: 1800,
    recordedAt: RECORDED_AT,
  },
  {
    id: "flow-3",
    flowId: "3",
    deviceId: "of:0000000000000002",
    priority: 100,
    match: {
      inPort: 1,
    },
    action: { drop: true },
    state: "pending",
    appId: "org.onlab.reactive",
    duration: 60,
    recordedAt: RECORDED_AT,
  },
]

// ============ ALERTS ============
export const mockAlerts: Alert[] = [
  {
    id: "alert-1",
    type: "device_lost",
    severity: "critical",
    deviceId: "of:0000000000000102",
    message: "Switch-Access-2 is offline",
    resolved: false,
    createdAt: new Date("2026-03-31T14:55:00Z"),
  },
  {
    id: "alert-2",
    type: "high_usage",
    severity: "warning",
    deviceId: "of:0000000000000001",
    portId: "port-1-1",
    message: "Port eth0 on Switch-Core-1 has 95% bandwidth usage",
    resolved: false,
    createdAt: new Date("2026-03-31T14:50:00Z"),
  },
  {
    id: "alert-3",
    type: "link_down",
    severity: "critical",
    message: "Link between Switch-Core-2 and Switch-Access-2 is down",
    resolved: false,
    createdAt: new Date("2026-03-31T14:40:00Z"),
  },
  {
    id: "alert-4",
    type: "high_usage",
    severity: "info",
    deviceId: "of:0000000000000001",
    message: "Device CPU usage at 78%",
    resolved: true,
    createdAt: new Date("2026-03-31T13:00:00Z"),
    resolvedAt: new Date("2026-03-31T14:00:00Z"),
  },
]

// ============ TOPOLOGY GRAPH ============
export function generateTopologyGraph() {
  const nodes: TopologyNode[] = mockDevices.map((device) => ({
    id: device.id,
    label: device.name,
    type: device.type,
    status: device.status,
    size: device.type === "switch" ? 30 : 20,
  }))

  const edges: TopologyEdge[] = mockLinks.map((link) => ({
    id: link.id,
    source: link.srcDevice,
    target: link.dstDevice,
    label: `${link.latency?.toFixed(2)}ms`,
    status: link.status,
  }))

  return { nodes, edges }
}

// ============ DASHBOARD STATS ============
export function generateDashboardStats(): DashboardStats {
  const activeDevices = mockDevices.filter((d) => d.status === "active").length
  const activeLinks = mockLinks.filter((l) => l.status === "active").length
  const criticalAlerts = mockAlerts.filter(
    (a) => !a.resolved && a.severity === "critical"
  ).length
  const warningAlerts = mockAlerts.filter(
    (a) => !a.resolved && a.severity === "warning"
  ).length

  return {
    totalDevices: mockDevices.length,
    activeDevices,
    totalLinks: mockLinks.length,
    activeLinks,
    totalFlows: mockFlows.length,
    criticalAlerts,
    warningAlerts,
  }
}

// ============ HELPER FUNCTIONS ============
export function getDevice(id: string): Device | undefined {
  return mockDevices.find((d) => d.id === id)
}

export function getDevicePorts(deviceId: string): Port[] {
  return mockPorts.filter((p) => p.deviceId === deviceId)
}

export function getDeviceFlows(deviceId: string): FlowRule[] {
  return mockFlows.filter((f) => f.deviceId === deviceId)
}

export function getOpenAlerts(): Alert[] {
  return mockAlerts.filter((a) => !a.resolved)
}

export function getCriticalAlerts(): Alert[] {
  return getOpenAlerts().filter((a) => a.severity === "critical")
}
