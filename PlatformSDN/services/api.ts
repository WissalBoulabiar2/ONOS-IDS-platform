// API Service - Connexion au Backend SDN Platform

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface ApiHealthResponse {
  status: "OK" | "DEGRADED" | "ERROR"
  message: string
  timestamp: string
  onos?: {
    connected: boolean
    error: string | null
    url: string
  }
  database?: {
    connected: boolean
    error: string | null
  }
}

export interface ApiDevice {
  id: string
  type: string
  available: boolean
  manufacturer?: string
  serialNumber?: string
  port?: string
}

export interface ApiDevicesResponse {
  total: number
  source?: "database" | "onos"
  devices: ApiDevice[]
}

export interface ApiPort {
  portNumber: number
  portSpeed?: string | number | null
  enabled: boolean
  live: boolean
  rxBytes: number
  txBytes: number
  rxPackets: number
  txPackets: number
}

export interface ApiPortsResponse {
  deviceId: string
  total: number
  source?: "database" | "onos"
  ports: ApiPort[]
}

export const sdnApi = {
  // Health Check
  async healthCheck(): Promise<ApiHealthResponse> {
    const response = await fetch(`${API_BASE_URL}/health`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Backend health check failed")
    }

    return data
  },

  // Devices
  async getDevices(): Promise<ApiDevicesResponse> {
    const response = await fetch(`${API_BASE_URL}/devices`)
    if (!response.ok) throw new Error('Failed to fetch devices')
    return response.json()
  },

  async getDevicePorts(deviceId: string): Promise<ApiPortsResponse> {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/ports`)
    if (!response.ok) throw new Error(`Failed to fetch ports for ${deviceId}`)
    return response.json()
  },

  // Topology
  async getTopology() {
    const response = await fetch(`${API_BASE_URL}/topology`)
    if (!response.ok) throw new Error('Failed to fetch topology')
    return response.json()
  },

  // Flows
  async getFlows() {
    const response = await fetch(`${API_BASE_URL}/flows`)
    if (!response.ok) throw new Error('Failed to fetch flows')
    return response.json()
  },

  async createFlow(deviceId: string, flowData: any) {
    const response = await fetch(`${API_BASE_URL}/flows/${deviceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flowData)
    })
    if (!response.ok) throw new Error('Failed to create flow')
    return response.json()
  },

  async deleteFlow(deviceId: string, flowId: string) {
    const response = await fetch(`${API_BASE_URL}/flows/${deviceId}/${flowId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete flow')
    return response.json()
  }
}

// Hook pour utiliser l'API
import { useEffect, useState } from 'react'

export function useONOS() {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    sdnApi.healthCheck()
      .then((health) => {
        setIsConnected(health.status !== "ERROR")
        setError(health.status === "DEGRADED" ? health.message : null)
      })
      .catch(err => {
        setIsConnected(false)
        setError(err.message)
      })
  }, [])

  return { isConnected, error, api: sdnApi }
}
