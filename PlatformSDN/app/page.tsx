"use client"

import React, { useState } from "react"
import Navigation from "@/components/navigation"
import { HealthScoreCircle } from "@/components/HealthScoreCircle"
import { KPICard } from "@/components/KPICard"
import { QuickActions } from "@/components/QuickActions"
import { TimelineEvents, type TimelineEvent } from "@/components/TimelineEvents"
import { TopologyMap } from "@/components/TopologyMap"
import { AlertList } from "@/components/AlertBadge"
import {
  useDevices,
  useTopology,
  useAlerts,
  useRealtimeUpdates,
} from "@/hooks/sdn-hooks"
import { generateDashboardStats } from "@/lib/mock-data"
import {
  Activity,
  AlertTriangle,
  Zap,
  Network,
  AlertCircle,
  Shield,
  Wifi,
  TrendingUp,
  Clock,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { devices, loading: devicesLoading } = useDevices()
  const { nodes, edges, loading: topologyLoading } = useTopology()
  const { alerts, loading: alertsLoading } = useAlerts(true)
  const timestamp = useRealtimeUpdates(5000)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const stats = generateDashboardStats()

  // Calculate health score (mock)
  const healthScore = Math.round(
    ((stats.activeDevices / stats.totalDevices) * 50 +
      (stats.activeLinks / stats.totalLinks) * 30 +
      ((10 - alerts.length) / 10) * 20) *
      100
  )

  // Mock timeline events
  const timelineEvents: TimelineEvent[] = [
    {
      id: "1",
      title: "Device Online",
      description: "Switch-Core-1 connected to controller",
      timestamp: new Date(Date.now() - 5 * 60000),
      type: "success",
      device: "Switch-Core-1",
    },
    {
      id: "2",
      title: "Link Down",
      description: "Connection lost between Switch-1 and Router-1",
      timestamp: new Date(Date.now() - 15 * 60000),
      type: "error",
      device: "Switch-1",
    },
    {
      id: "3",
      title: "Configuration Applied",
      description: "Flow rules updated on Switch-2",
      timestamp: new Date(Date.now() - 1 * 3600000),
      type: "info",
      device: "Switch-2",
    },
    {
      id: "4",
      title: "High CPU Usage",
      description: "CPU usage on Router-1 exceeded 85%",
      timestamp: new Date(Date.now() - 2 * 3600000),
      type: "warning",
      device: "Router-1",
    },
    {
      id: "5",
      title: "Sync Completed",
      description: "Network topology synchronized",
      timestamp: new Date(Date.now() - 4 * 3600000),
      type: "success",
      device: "System",
    },
  ]

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                SDN Network Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Real-time network monitoring • Last updated:{" "}
                {timestamp.toLocaleTimeString()}
              </p>
            </div>

            {/* Health Score */}
            <div className="md:text-right">
              <HealthScoreCircle score={healthScore} label="Overall Health" size="md" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* KPI Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Network Devices"
            value={stats.activeDevices}
            unit={`/ ${stats.totalDevices}`}
            status={stats.activeDevices === stats.totalDevices ? "healthy" : "warning"}
            trend={5}
            icon={<Network className="h-5 w-5" />}
            subtitle="Active switches & routers"
          />

          <KPICard
            title="Active Links"
            value={stats.activeLinks}
            unit={`/ ${stats.totalLinks}`}
            status={stats.activeLinks === stats.totalLinks ? "healthy" : "warning"}
            trend={-2}
            icon={<Zap className="h-5 w-5" />}
            subtitle="Network connections"
          />

          <KPICard
            title="Flow Rules"
            value={stats.activeFlows}
            unit="rules"
            status="healthy"
            trend={12}
            icon={<Activity className="h-5 w-5" />}
            subtitle="Active OpenFlow rules"
          />

          <KPICard
            title="Alerts"
            value={alerts.length}
            unit={alerts.length > 0 ? "active" : "none"}
            status={
              alerts.length === 0
                ? "healthy"
                : alerts.length < 3
                  ? "warning"
                  : "critical"
            }
            trend={-3}
            icon={<AlertCircle className="h-5 w-5" />}
            subtitle="System notifications"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topology Map */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  Network Topology
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {nodes.length} nodes • {edges.length} links
                </span>
              </div>

              {topologyLoading ? (
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">Loading topology...</p>
                </div>
              ) : (
                <TopologyMap
                  nodes={nodes}
                  edges={edges}
                  selectedNode={selectedNode}
                  onNodeClick={handleNodeClick}
                />
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Link
                  href="/topology"
                  className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                >
                  View Full Topology →
                </Link>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                System Alerts
              </h2>

              {alertsLoading ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading alerts...</p>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 mb-3">
                    <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No alerts</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">System is healthy</p>
                </div>
              ) : (
                <AlertList alerts={alerts} limit={5} />
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Link
                  href="/alerts"
                  className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                >
                  View All Alerts →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Events */}
        <div className="mt-8">
          <TimelineEvents events={timelineEvents} limit={5} />
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Auto-refresh enabled • Updates every 5 seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span>Connected to ONOS Controller v2.8.1</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Uptime: 45 days, 3 hours</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
