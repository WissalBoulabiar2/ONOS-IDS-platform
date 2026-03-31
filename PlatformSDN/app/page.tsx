"use client"

import React, { useState } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import { HealthScoreCircle } from "@/components/HealthScoreCircle"
import { KPICard } from "@/components/KPICard"
import { QuickActions } from "@/components/QuickActions"
import { TimelineEvents, type TimelineEvent } from "@/components/TimelineEvents"
import { TopologyMap } from "@/components/TopologyMap"
import { AlertList } from "@/components/AlertBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  useAlerts,
  useDevices,
  useRealtimeUpdates,
  useTopology,
} from "@/hooks/sdn-hooks"
import { generateDashboardStats } from "@/lib/mock-data"
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Network,
  Shield,
  TrendingUp,
  Wifi,
  Zap,
} from "lucide-react"

const timelineEvents: TimelineEvent[] = [
  {
    id: "1",
    title: "Core switch registered",
    description: "Switch-Core-1 successfully rejoined the ONOS controller.",
    timestamp: new Date("2026-03-31T14:55:00Z"),
    type: "success",
    device: "of:0000000000000001",
  },
  {
    id: "2",
    title: "Inter-switch link degraded",
    description: "Packet loss detected between aggregation switches during refresh cycle.",
    timestamp: new Date("2026-03-31T14:42:00Z"),
    type: "warning",
    device: "link:s1-s2",
  },
  {
    id: "3",
    title: "Flow policy updated",
    description: "Forwarding rule priority increased on the distribution segment.",
    timestamp: new Date("2026-03-31T14:02:00Z"),
    type: "info",
    device: "of:0000000000000002",
  },
  {
    id: "4",
    title: "Recovery completed",
    description: "Topology synchronization completed after controller heartbeat check.",
    timestamp: new Date("2026-03-31T13:00:00Z"),
    type: "success",
    device: "controller",
  },
]

export default function DashboardPage() {
  const { devices, loading: devicesLoading } = useDevices()
  const { nodes, edges, loading: topologyLoading } = useTopology()
  const { alerts, loading: alertsLoading } = useAlerts(true)
  const timestamp = useRealtimeUpdates(5000)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const stats = generateDashboardStats()
  const offlineDevices = devices.filter((device) => device.status !== "active").length
  const warningLevel = alerts.length > 2 || offlineDevices > 0 ? "warning" : "healthy"
  const healthScore = Math.max(
    68,
    Math.min(
      99,
      Math.round(
        ((stats.activeDevices / stats.totalDevices) * 50 +
          (stats.activeLinks / stats.totalLinks) * 30 +
          ((10 - alerts.length) / 10) * 20) *
          100
      )
    )
  )

  const selectedNodeDetails = nodes.find((node) => node.id === selectedNode)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                  Live Dashboard
                </Badge>
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  ONOS Ready
                </Badge>
              </div>

              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
                Centralized SDN Supervision
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Monitor topology, inspect device health, review active flows, and prepare the platform
                for backend, ONOS, and PostgreSQL integration.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="mb-2 flex items-center gap-2 text-cyan-200">
                    <Activity className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.25em]">Refresh</span>
                  </div>
                  <p className="text-lg font-semibold">{timestamp ? timestamp.toLocaleTimeString() : "--:--:--"}</p>
                  <p className="mt-1 text-xs text-slate-400">Dashboard updated every 5 seconds</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="mb-2 flex items-center gap-2 text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.25em]">Controller</span>
                  </div>
                  <p className="text-lg font-semibold">Connected</p>
                  <p className="mt-1 text-xs text-slate-400">ONOS v2.8.1 local environment</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="mb-2 flex items-center gap-2 text-amber-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.25em]">Focus</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {alerts.length > 0 ? `${alerts.length} alerts open` : "Stable network"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {offlineDevices > 0 ? `${offlineDevices} device(s) need attention` : "No offline devices detected"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:min-w-[280px]">
              <HealthScoreCircle score={healthScore} label="Network Health" size="md" />
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-white">Operational Summary</p>
                <p className="mt-2">
                  {stats.activeDevices}/{stats.totalDevices} devices online, {stats.activeLinks}/{stats.totalLinks} links healthy.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  <Link href="/topology">
                    Open Topology
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                  <Link href="/configuration">Review Settings</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-8">
          <QuickActions title="Operations Shortcuts" />
        </div>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KPICard
            title="Managed Devices"
            value={stats.activeDevices}
            unit={`/ ${stats.totalDevices}`}
            status={stats.activeDevices === stats.totalDevices ? "healthy" : "warning"}
            trend={5}
            icon={<Network className="h-5 w-5" />}
            subtitle="Switches and routers under supervision"
          />
          <KPICard
            title="Operational Links"
            value={stats.activeLinks}
            unit={`/ ${stats.totalLinks}`}
            status={stats.activeLinks === stats.totalLinks ? "healthy" : "warning"}
            trend={-2}
            icon={<Zap className="h-5 w-5" />}
            subtitle="Inter-device connectivity state"
          />
          <KPICard
            title="Active Flow Rules"
            value={stats.totalFlows}
            unit="rules"
            status="healthy"
            trend={12}
            icon={<Activity className="h-5 w-5" />}
            subtitle="Policies prepared for forwarding control"
          />
          <KPICard
            title="Open Alerts"
            value={alerts.length}
            unit={alerts.length > 0 ? "active" : "none"}
            status={warningLevel}
            trend={-3}
            icon={<AlertCircle className="h-5 w-5" />}
            subtitle="Current incidents requiring attention"
          />
        </section>

        <section className="mb-8 grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="space-y-8 xl:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                    <Wifi className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    Topology Snapshot
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Interactive view of the currently discovered SDN infrastructure.
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {nodes.length} nodes • {edges.length} links
                </span>
              </div>

              {topologyLoading ? (
                <div className="flex aspect-video items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">Loading topology...</p>
                </div>
              ) : (
                <TopologyMap
                  nodes={nodes}
                  edges={edges}
                  selectedNode={selectedNode}
                  onNodeClick={setSelectedNode}
                />
              )}

              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-200 pt-5 dark:border-gray-800 md:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                  <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Selected node</p>
                  {selectedNodeDetails ? (
                    <>
                      <p className="font-mono text-sm text-cyan-600 dark:text-cyan-400">{selectedNodeDetails.id}</p>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Type: {selectedNodeDetails.type} • Status: {selectedNodeDetails.status}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click a node to inspect its summary from the dashboard.
                    </p>
                  )}
                </div>
                <div className="flex items-end justify-between rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                  <div>
                    <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Topology workspace</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Open the dedicated page for a larger map and detailed interactions.
                    </p>
                  </div>
                  <Button asChild variant="ghost" className="text-cyan-600 hover:text-cyan-500 dark:text-cyan-400">
                    <Link href="/topology">Open</Link>
                  </Button>
                </div>
              </div>
            </div>

            <TimelineEvents events={timelineEvents} title="Network Activity Timeline" limit={4} />
          </div>

          <div className="space-y-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                Alert Overview
              </h2>

              {alertsLoading ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading alerts...</p>
              ) : alerts.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                    <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">No active alerts</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">The monitored environment is stable right now.</p>
                </div>
              ) : (
                <AlertList alerts={alerts} limit={5} />
              )}

              <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
                <Link
                  href="/alerts"
                  className="text-sm font-medium text-cyan-600 hover:underline dark:text-cyan-400"
                >
                  View all alerts →
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Platform Summary</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-950">
                  <Clock className="mt-0.5 h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Auto refresh active</p>
                    <p className="text-gray-500 dark:text-gray-400">Dashboard polling and visual refresh are enabled for live demos.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-950">
                  <Wifi className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Controller synchronization</p>
                    <p className="text-gray-500 dark:text-gray-400">Frontend is prepared to consume ONOS-backed data through the future API layer.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-950">
                  <TrendingUp className="mt-0.5 h-4 w-4 text-violet-600 dark:text-violet-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Integration roadmap</p>
                    <p className="text-gray-500 dark:text-gray-400">Next phases will connect backend routes, ONOS endpoints, and PostgreSQL history.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-200 bg-cyan-50/80 p-6 shadow-sm dark:border-cyan-900/40 dark:bg-cyan-950/20">
              <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Frontend Milestone</p>
              <p className="mt-2 text-sm text-cyan-600 dark:text-cyan-400">
                This dashboard is now positioned as the main supervision entry point for the SDN platform.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
