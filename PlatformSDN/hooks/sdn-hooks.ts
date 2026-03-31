// Custom Hooks for SDN Data Management

import { useState, useEffect } from "react"
import {
  Device,
  Port,
  Link,
  FlowRule,
  Alert,
  TopologyNode,
  TopologyEdge,
} from "@/lib/types"
import {
  mockDevices,
  mockPorts,
  mockLinks,
  mockFlows,
  mockAlerts,
  getDevice,
  getDevicePorts,
  getDeviceFlows,
  getOpenAlerts,
  generateTopologyGraph,
} from "@/lib/mock-data"

// Hook: Fetch all devices
export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Simulate API delay
      const timer = setTimeout(() => {
        setDevices(mockDevices)
        setLoading(false)
      }, 500)

      return () => clearTimeout(timer)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setLoading(false)
    }
  }, [])

  return { devices, loading, error }
}

// Hook: Fetch single device details
export function useDevice(deviceId: string) {
  const [device, setDevice] = useState<Device | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDevice(getDevice(deviceId))
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [deviceId])

  return { device, loading }
}

// Hook: Fetch ports for a device
export function useDevicePorts(deviceId: string) {
  const [ports, setPorts] = useState<Port[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPorts(getDevicePorts(deviceId))
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [deviceId])

  return { ports, loading }
}

// Hook: Fetch flows for a device
export function useFlows(deviceId?: string) {
  const [flows, setFlows] = useState<FlowRule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (deviceId) {
        setFlows(getDeviceFlows(deviceId))
      } else {
        setFlows(mockFlows)
      }
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [deviceId])

  return { flows, loading }
}

// Hook: Fetch topology (nodes and edges)
export function useTopology() {
  const [nodes, setNodes] = useState<TopologyNode[]>([])
  const [edges, setEdges] = useState<TopologyEdge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      const { nodes, edges } = generateTopologyGraph()
      setNodes(nodes)
      setEdges(edges)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return { nodes, edges, loading }
}

// Hook: Fetch alerts
export function useAlerts(openOnly = false) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAlerts(openOnly ? getOpenAlerts() : mockAlerts)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [openOnly])

  return { alerts, loading }
}

// Hook: Real-time updates (simulate WebSocket)
export function useRealtimeUpdates(interval = 5000) {
  const [timestamp, setTimestamp] = useState<Date | null>(null)

  useEffect(() => {
    setTimestamp(new Date())

    const timer = setInterval(() => {
      setTimestamp(new Date())
    }, interval)

    return () => clearInterval(timer)
  }, [interval])

  return timestamp
}
