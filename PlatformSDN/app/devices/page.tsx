"use client"

import React, { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import { DeviceTable } from "@/components/DeviceTable"
import { DeviceDetailsModal } from "@/components/DeviceDetailsModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDevices } from "@/hooks/sdn-hooks"
import {
  HardDrive,
  Plus,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"

interface Device {
  id: string
  type: string
  available: boolean
  manufacturer?: string
  serialNumber?: string
}

interface Port {
  portNumber: number
  enabled: boolean
  live: boolean
  rxBytes: number
  txBytes: number
  rxPackets: number
  txPackets: number
}

export default function DevicesPage() {
  const { devices: hookDevices, loading } = useDevices()
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [ports, setPorts] = useState<Port[]>([])
  const [showModal, setShowModal] = useState(false)
  const [portsLoading, setPortsLoading] = useState(false)

  // Convert mock data to Device interface
  useEffect(() => {
    if (hookDevices && hookDevices.length > 0) {
      const formattedDevices: Device[] = hookDevices.map((d: any) => ({
        id: d.id || "unknown",
        type: d.type || "SWITCH",
        available: d.available !== false,
        manufacturer: d.manufacturer || "Unknown",
        serialNumber: d.serialNumber || "N/A",
      }))
      setDevices(formattedDevices)
    }
  }, [hookDevices])

  // Mock ports data for selected device
  const getMockPorts = (deviceId: string): Port[] => {
    const portCount = Math.floor(Math.random() * 4) + 2 // 2-5 ports
    return Array.from({ length: portCount }, (_, i) => ({
      portNumber: i + 1,
      enabled: Math.random() > 0.2,
      live: Math.random() > 0.3,
      rxBytes: Math.floor(Math.random() * 1000000),
      txBytes: Math.floor(Math.random() * 900000),
      rxPackets: Math.floor(Math.random() * 100000),
      txPackets: Math.floor(Math.random() * 90000),
    }))
  }

  const handleSelectDevice = async (device: Device) => {
    setSelectedDevice(device)
    setPortsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockPorts = getMockPorts(device.id)
    setPorts(mockPorts)
    setPortsLoading(false)
    setShowModal(true)
  }

  const handleAction = (action: string, device: Device) => {
    console.log(`Action: ${action} on device: ${device.id}`)
    // TODO: Implement actions
  }

  const handleRefresh = () => {
    // TODO: Trigger refresh from hook
    console.log("Refreshing devices...")
  }

  // Statistics
  const onlineCount = devices.filter((d) => d.available).length
  const offlineCount = devices.filter((d) => !d.available).length

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <HardDrive className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                Network Devices
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and monitor all network equipments
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button className="gap-2 bg-cyan-600 hover:bg-cyan-700">
                <Plus className="h-4 w-4" />
                Add Device
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {devices.length}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Network equipments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Online
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {onlineCount}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Active devices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
                Offline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {offlineCount}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Unreachable
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {devices.length > 0
                  ? ((onlineCount / devices.length) * 100).toFixed(0)
                  : "0"}
                %
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Availability rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {offlineCount > 0 && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300">
                {offlineCount} device{offlineCount > 1 ? "s" : ""} offline
              </h3>
              <p className="text-sm text-red-800 dark:text-red-400">
                Check connectivity and power status for unreachable equipments
              </p>
            </div>
          </div>
        )}

        {/* Devices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Device List</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceTable
              devices={devices}
              isLoading={loading}
              onSelectDevice={handleSelectDevice}
              onActionClick={handleAction}
            />
          </CardContent>
        </Card>

        {/* Device Details Modal */}
        <DeviceDetailsModal
          device={selectedDevice}
          ports={ports}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedDevice(null)
            setPorts([])
          }}
          isLoading={portsLoading}
        />
      </main>
    </div>
  )
}
