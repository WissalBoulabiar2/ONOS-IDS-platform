"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Network, HardDrive, Activity, AlertCircle, CheckCircle } from "lucide-react"

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

interface DeviceDetailsModalProps {
  device: Device | null
  ports: Port[]
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
}

export function DeviceDetailsModal({
  device,
  ports,
  isOpen,
  onClose,
  isLoading = false,
}: DeviceDetailsModalProps) {
  if (!device) return null

  // Mock data pour graphiques
  const trafficData = [
    { time: "00:00", rx: 100, tx: 80 },
    { time: "04:00", rx: 150, tx: 120 },
    { time: "08:00", rx: 200, tx: 180 },
    { time: "12:00", rx: 280, tx: 240 },
    { time: "16:00", rx: 320, tx: 300 },
  ]

  const portStatsData = (ports || []).map((port, idx) => ({
    name: `Port ${port.portNumber}`,
    rx: port.rxBytes,
    tx: port.txBytes,
  }))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            Device Details: {device.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Device Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Type</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{device.type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Status</p>
              <Badge variant={device.available ? "default" : "destructive"}>
                {device.available ? "Online" : "Offline"}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Manufacturer</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {device.manufacturer || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Serial</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white">
                {device.serialNumber || "N/A"}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="ports" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ports">Ports ({ports?.length || 0})</TabsTrigger>
              <TabsTrigger value="traffic">Traffic</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            {/* Ports Tab */}
            <TabsContent value="ports" className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Loading ports...
                </div>
              ) : ports && ports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Port #</th>
                        <th className="px-4 py-2 text-left font-semibold">Status</th>
                        <th className="px-4 py-2 text-right font-semibold">RX (bytes)</th>
                        <th className="px-4 py-2 text-right font-semibold">TX (bytes)</th>
                        <th className="px-4 py-2 text-right font-semibold">RX (packets)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ports.map((port) => (
                        <tr
                          key={port.portNumber}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          <td className="px-4 py-3 font-medium">{port.portNumber}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Badge
                                variant={port.enabled ? "default" : "outline"}
                                className="text-xs"
                              >
                                {port.enabled ? "Enabled" : "Disabled"}
                              </Badge>
                              {port.live && (
                                <Badge variant="secondary" className="text-xs">
                                  Live
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs">
                            {(port.rxBytes / 1024).toFixed(2)} KB
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs">
                            {(port.txBytes / 1024).toFixed(2)} KB
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs">
                            {port.rxPackets.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No ports information available
                </div>
              )}
            </TabsContent>

            {/* Traffic Tab */}
            <TabsContent value="traffic">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="rx"
                      stroke="#06b6d4"
                      name="RX (bytes)"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="tx"
                      stroke="#0ea5e9"
                      name="TX (bytes)"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={portStatsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rx" fill="#06b6d4" name="RX" />
                    <Bar dataKey="tx" fill="#0ea5e9" name="TX" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
