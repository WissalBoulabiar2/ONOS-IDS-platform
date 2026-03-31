"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import { DeviceTable } from "@/components/DeviceTable"
import { DeviceDetailsModal } from "@/components/DeviceDetailsModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { mockDevices, getDevicePorts as getMockDevicePorts } from "@/lib/mock-data"
import { ApiDevice, sdnApi } from "@/services/api"
import {
  AlertTriangle,
  ArrowRight,
  Cpu,
  HardDrive,
  Network,
  RefreshCw,
  Server,
  ShieldCheck,
} from "lucide-react"

interface Device {
  id: string
  type: string
  available: boolean
  name?: string
  manufacturer?: string
  serialNumber?: string
  portCount?: number
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
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<"api" | "mock">("api")
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [ports, setPorts] = useState<Port[]>([])
  const [showModal, setShowModal] = useState(false)
  const [portsLoading, setPortsLoading] = useState(false)

  const normalizeType = (type?: string) => {
    const normalized = (type || "switch").toLowerCase()
    return normalized === "switch" || normalized === "router" || normalized === "host"
      ? normalized
      : "switch"
  }

  const mapApiDevice = (device: ApiDevice, portCount?: number): Device => {
    const shortId = device.id.split(":").pop() || device.id

    return {
      id: device.id || "unknown",
      type: normalizeType(device.type),
      available: device.available !== false,
      name: `Device-${shortId}`,
      manufacturer: device.manufacturer || "Unknown",
      serialNumber: device.serialNumber || "N/A",
      portCount,
    }
  }

  const mapMockDevices = (): Device[] =>
    mockDevices.map((device) => ({
      id: device.id,
      type: device.type,
      available: device.status === "active",
      name: device.name,
      manufacturer: device.manufacturer || "Unknown",
      serialNumber: "N/A",
      portCount: getMockDevicePorts(device.id).length,
    }))

  const fetchDevices = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await sdnApi.getDevices()
      const devicesWithPorts = await Promise.all(
        data.devices.map(async (device) => {
          try {
            const portData = await sdnApi.getDevicePorts(device.id)
            return mapApiDevice(device, portData.total ?? portData.ports.length)
          } catch {
            return mapApiDevice(device)
          }
        })
      )

      setDevices(devicesWithPorts)
      setSource("api")
    } catch (err) {
      setDevices(mapMockDevices())
      setSource("mock")
      setError(err instanceof Error ? err.message : "Unable to reach backend devices API")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const handleSelectDevice = async (device: Device) => {
    setSelectedDevice(device)
    setShowModal(true)
    setPortsLoading(true)

    try {
      const data = await sdnApi.getDevicePorts(device.id)
      setPorts(
        data.ports.map((port) => ({
          portNumber: port.portNumber,
          enabled: port.enabled,
          live: port.live,
          rxBytes: port.rxBytes,
          txBytes: port.txBytes,
          rxPackets: port.rxPackets,
          txPackets: port.txPackets,
        }))
      )
    } catch {
      setPorts(
        getMockDevicePorts(device.id).map((port) => ({
          portNumber: port.portNumber,
          enabled: port.status === "enabled",
          live: port.status === "enabled",
          rxBytes: port.rxBytes,
          txBytes: port.txBytes,
          rxPackets: port.rxPackets,
          txPackets: port.txPackets,
        }))
      )
    } finally {
      setPortsLoading(false)
    }
  }

  const handleAction = (action: string, device: Device) => {
    console.log(`Action: ${action} on device: ${device.id}`)
  }

  const handleRefresh = () => {
    fetchDevices()
  }

  const onlineCount = devices.filter((d) => d.available).length
  const offlineCount = devices.filter((d) => !d.available).length
  const totalPorts = devices.reduce((sum, device) => sum + (device.portCount || 0), 0)
  const coreDevices = devices.filter((device) => device.type === "switch").length

  const selectedDeviceSummary = useMemo(() => {
    if (!selectedDevice) return null
    return devices.find((device) => device.id === selectedDevice.id) ?? selectedDevice
  }, [devices, selectedDevice])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                  Device Inventory
                </Badge>
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  Monitoring Ready
                </Badge>
              </div>
              <h1 className="mb-3 flex items-center gap-3 text-4xl font-bold tracking-tight sm:text-5xl">
                <HardDrive className="h-10 w-10 text-cyan-400" />
                Network Devices
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Review SDN switches and routers, inspect availability, and prepare this inventory view for
                backend-driven details such as live ports, metrics, and flow context.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:min-w-[300px]">
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-cyan-200">Current focus</p>
              <p className="text-2xl font-semibold">
                {offlineCount > 0 ? `${offlineCount} device(s) offline` : "All discovered devices reachable"}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {source === "api"
                  ? "Live ONOS inventory is active through the backend API."
                  : "Backend unavailable, fallback inventory is shown from local mock data."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button asChild className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  <Link href="/topology">
                    Open Topology
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200">Backend fallback active</h3>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                {error}. The page is showing mock data until the API becomes available again.
              </p>
            </div>
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Network className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Inventory</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{devices.length}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Managed devices discovered in the platform
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Online</span>
              </div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{onlineCount}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Devices currently reachable in the active inventory source
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Server className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Ports</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalPorts}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Total ports declared across the device inventory
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Cpu className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Availability</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {devices.length > 0
                  ? ((onlineCount / devices.length) * 100).toFixed(0)
                  : "0"}
                %
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Reachability rate across all managed devices
              </p>
            </CardContent>
          </Card>
        </section>

        {offlineCount > 0 && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
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

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardContent className="pt-6">
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Device Inventory Table</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Filter by status or type, then open the details panel to inspect ports and traffic charts.
                  </p>
                </div>
                <DeviceTable
                  devices={devices}
                  isLoading={loading}
                  onSelectDevice={handleSelectDevice}
                  onActionClick={handleAction}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardContent className="pt-6">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Selection Summary</h2>
                {selectedDeviceSummary ? (
                  <div className="space-y-4 text-sm">
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Device</p>
                      <p className="mt-2 font-mono text-sm text-cyan-600 dark:text-cyan-400">{selectedDeviceSummary.id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Type</p>
                        <p className="mt-2 capitalize">{selectedDeviceSummary.type}</p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Ports</p>
                        <p className="mt-2">{selectedDeviceSummary.portCount || 0}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Manufacturer</p>
                      <p className="mt-2">{selectedDeviceSummary.manufacturer || "Unknown"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                    Select a device from the table to prepare its detailed inspection modal.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardContent className="pt-6 text-sm text-gray-600 dark:text-gray-400">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Operational Notes</h2>
                <p className="mb-3">Switch-class devices discovered: {coreDevices}</p>
                <p className="mb-3">Offline devices should later trigger backend-driven alerts and incident workflows.</p>
                <p>
                  {source === "api"
                    ? "Port statistics in the modal now come from the backend when available."
                    : "The page is ready, but currently displaying mock fallback data."}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

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
