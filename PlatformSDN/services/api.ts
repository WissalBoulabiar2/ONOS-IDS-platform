// API Service - Connexion au Backend SDN Platform

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const sdnApi = {
  // Health Check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.json()
  },

  // Devices
  async getDevices() {
    const response = await fetch(`${API_BASE_URL}/devices`)
    if (!response.ok) throw new Error('Failed to fetch devices')
    return response.json()
  },

  async getDevicePorts(deviceId: string) {
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
      .then(() => setIsConnected(true))
      .catch(err => {
        setIsConnected(false)
        setError(err.message)
      })
  }, [])

  return { isConnected, error, api: sdnApi }
}
