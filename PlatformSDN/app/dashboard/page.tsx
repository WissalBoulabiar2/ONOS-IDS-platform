"use client"

import React, { useCallback, useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import Navigation from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Wifi, Activity, AlertCircle, TrendingUp, Server, Download } from "lucide-react"
import { useExportPDF } from "@/hooks/useExportPDF"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface DashboardStats {
  total_devices: number
  online_devices: number
  offline_devices: number
  total_ports: number
  live_ports: number
  enabled_ports: number
  total_flows: number
  active_alerts: number
  active_links: number
}

interface DeviceMetric {
  device_id: string
  type: string
  available: boolean
  live_ports: number
  enabled_ports: number
  total_ports: number
  total_rx_bytes: number
  total_tx_bytes: number
  last_updated: string
}

interface DashboardStatsResponse {
  source: "database" | "onos"
  timestamp: string
  stats: DashboardStats
}

interface DeviceMetricsResponse {
  source: "database" | "onos"
  metrics: DeviceMetric[]
}

const COLORS = ["#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [devices, setDevices] = useState<DeviceMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<"database" | "onos" | "mixed">("onos")
  const [exporting, setExporting] = useState(false)
  const { exportToPDF } = useExportPDF()

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsRes, metricsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/stats`),
        fetch(`${API_BASE_URL}/metrics/devices`),
      ])

      if (!statsRes.ok) throw new Error("Failed to fetch stats")
      if (!metricsRes.ok) throw new Error("Failed to fetch metrics")

      const statsData: DashboardStatsResponse = await statsRes.json()
      const metricsData: DeviceMetricsResponse = await metricsRes.json()

      setStats(statsData.stats)
      setDevices(metricsData.metrics)
      setDataSource(
        statsData.source === metricsData.source ? statsData.source : "mixed"
      )
      setLastSync(new Date(statsData.timestamp).toLocaleTimeString())
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 5000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  const handleExportPDF = async () => {
    try {
      setExporting(true)
      await exportToPDF("dashboard-container", `SDN-Dashboard-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Failed to export PDF:", error)
    } finally {
      setExporting(false)
    }
  }

  const deviceTypeData = devices.reduce<{ name: string; value: number }[]>((acc, device) => {
    const existing = acc.find((entry) => entry.name === device.type)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({ name: device.type, value: 1 })
    }
    return acc
  }, [])

  const portStatusData = stats ? [
    { name: "Live", value: stats.live_ports, color: "#10b981" },
    { name: "Enabled standby", value: Math.max(stats.enabled_ports - stats.live_ports, 0), color: "#f59e0b" },
    { name: "Disabled", value: Math.max(stats.total_ports - stats.enabled_ports, 0), color: "#ef4444" },
  ] : []

  const trafficData = devices.slice(0, 8).map((device) => ({
    name: device.device_id.split(":").pop() || device.device_id,
    rx: Math.round(device.total_rx_bytes / (1024 * 1024)),
    tx: Math.round(device.total_tx_bytes / (1024 * 1024)),
  }))

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navigation />

      <main id="dashboard-container" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HERO SECTION */}
        <section className="mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                  Real-time Monitoring
                </Badge>
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  {dataSource === "database"
                    ? "PostgreSQL cache"
                    : dataSource === "onos"
                      ? "Live ONOS"
                      : "Mixed sources"}
                </Badge>
              </div>
              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">SDN Dashboard</h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Complete network visibility with ONOS data synchronized every 5 seconds to PostgreSQL
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-cyan-200">Last Sync</p>
              <p className="text-lg font-semibold">{lastSync || "Syncing..."}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={fetchDashboardData}
                  variant="outline"
                  disabled={loading}
                  className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Refreshing" : "Refresh"}
                </Button>
                <Button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="flex-1 border-white/20 bg-cyan-600 text-white hover:bg-cyan-700"
                >
                  <Download className={`mr-2 h-4 w-4 ${exporting ? "animate-spin" : ""}`} />
                  {exporting ? "Exporting" : "Export PDF"}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ERROR ALERT */}
        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">Error fetching data</h3>
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* KEY METRICS */}
        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Server className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Devices</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_devices || 0}</p>
              <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                <Wifi className="inline mr-1 h-4 w-4" />
                {stats?.online_devices || 0} Online
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Ports</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.live_ports || 0}</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {stats?.enabled_ports || 0} Enabled
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Flows</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_flows || 0}</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Active rules
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Alerts</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.active_alerts || 0}</p>
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                Unresolved
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CHARTS SECTION */}
        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Device Types Pie Chart */}
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle>Device Types Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Port Status Bar Chart */}
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle>Port Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={portStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {portStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* TRAFFIC DATA */}
        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardHeader>
            <CardTitle>Device Traffic (RX/TX in MB)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="rx" fill="#06b6d4" name="RX (MB)" />
                <Bar dataKey="tx" fill="#10b981" name="TX (MB)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* DEVICES TABLE */}
        <Card className="mt-8 border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardHeader>
            <CardTitle>Connected Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Device ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Ports</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">RX (MB)</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">TX (MB)</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => (
                    <tr key={device.device_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-mono text-xs text-cyan-600 dark:text-cyan-400">
                        {device.device_id}
                      </td>
                      <td className="px-4 py-3 capitalize">{device.type}</td>
                      <td className="px-4 py-3">
                        <Badge className={device.available ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}>
                          {device.available ? "Online" : "Offline"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {device.live_ports}/{device.total_ports}
                      </td>
                      <td className="px-4 py-3">
                        {(device.total_rx_bytes / (1024 * 1024)).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {(device.total_tx_bytes / (1024 * 1024)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
