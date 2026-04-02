// SDN Types - ONOS Network Model

export interface Device {
  id: string // e.g., "of:0000000000000001"
  name: string // e.g., "Switch-Core-1"
  type: "switch" | "router" | "host"
  manufacturer?: string
  hwVersion?: string
  swVersion?: string
  status: "active" | "inactive"
  port_count?: number
  latitude?: number
  longitude?: number
  recordedAt: Date
}

export interface Port {
  id: string
  deviceId: string
  portNumber: number
  name?: string
  status: "enabled" | "disabled"
  rxBytes: number
  txBytes: number
  rxPackets: number
  txPackets: number
  rxErrors?: number
  txErrors?: number
  recordedAt: Date
}

export interface Link {
  id: string
  srcDevice: string // device ID
  srcPort: number
  dstDevice: string
  dstPort: number
  status: "active" | "inactive"
  latency?: number // ms
  available_bandwidth?: number // bps
  recordedAt: Date
}

export interface FlowRule {
  id: string
  flowId: string // ONOS flow ID
  deviceId: string
  priority: number
  match: {
    etherType?: string
    ipProtocol?: string
    srcIp?: string
    dstIp?: string
    srcPort?: number
    dstPort?: number
    inPort?: number
  }
  action: {
    output?: number | string
    drop?: boolean
    setIpDst?: string
  }
  state: "added" | "removed" | "pending"
  appId?: string
  duration?: number // seconds
  recordedAt: Date
}

export interface Alert {
  id: string
  type: "link_down" | "high_usage" | "device_lost" | "flow_error" | "port_error"
  severity: "critical" | "warning" | "info"
  deviceId?: string
  portId?: string
  message: string
  resolved: boolean
  createdAt: Date
  resolvedAt?: Date
}

export interface Metric {
  id: string
  type: "bandwidth" | "latency" | "packetLoss" | "cpu" | "memory"
  deviceId?: string
  portId?: string
  value: number
  unit: string
  timestamp: Date
}

export interface TopologyNode {
  id: string
  label: string
  type: "switch" | "router" | "host"
  status: "active" | "inactive"
  size?: number
  available?: boolean
  manufacturer?: string | null
  serialNumber?: string | null
  hwVersion?: string | null
  swVersion?: string | null
  mac?: string | null
  vlan?: string | null
  ipAddresses?: string[]
  location?: string | null
}

export interface TopologyEdge {
  id: string
  source: string
  target: string
  label?: string
  status: "active" | "inactive"
  sourcePort?: string | null
  targetPort?: string | null
  kind?: "infrastructure" | "access"
  utilization?: number | null
  throughput?: number | null
  loadState?: "nominal" | "warm" | "hot" | "unknown"
}

export interface User {
  id: string
  username: string
  email: string
  role: "admin" | "operator" | "viewer"
  createdAt: Date
}

export interface StoreState {
  user: User | null
  setUser: (user: User | null) => void
  filters: {
    deviceType?: "switch" | "router" | "host"
    status?: "active" | "inactive"
    searchTerm?: string
  }
  setFilters: (filters: Partial<StoreState["filters"]>) => void
}

export interface DashboardStats {
  totalDevices: number
  activeDevices: number
  totalLinks: number
  activeLinks: number
  totalFlows: number
  criticalAlerts: number
  warningAlerts: number
}
