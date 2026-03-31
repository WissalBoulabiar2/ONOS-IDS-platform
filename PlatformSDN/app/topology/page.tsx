"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TopologyMap } from "@/components/TopologyMap"
import { useTopology, useRealtimeUpdates } from "@/hooks/sdn-hooks"
import {
  Activity,
  ArrowRight,
  CircleDot,
  Cpu,
  GitBranch,
  Network,
  RefreshCw,
  Router,
  Server,
  Square,
  Wifi,
} from "lucide-react"

export default function TopologyPage() {
  const { nodes, edges, loading } = useTopology()
  const timestamp = useRealtimeUpdates(5000)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const selectedNodeDetails = useMemo(
    () => nodes.find((node) => node.id === selectedNode) ?? null,
    [nodes, selectedNode]
  )

  const activeNodes = nodes.filter((node) => node.status === "active").length
  const inactiveNodes = nodes.length - activeNodes
  const switchCount = nodes.filter((node) => node.type === "switch").length

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                  Interactive Map
                </Badge>
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  Realtime View
                </Badge>
              </div>
              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
                Network Topology Explorer
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Inspect switches, observe link relationships, and prepare the topology view for live ONOS
                discovery and backend-driven details.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:min-w-[280px]">
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-cyan-200">Last refresh</p>
              <p className="text-2xl font-semibold">{timestamp.toLocaleTimeString()}</p>
              <p className="mt-2 text-sm text-slate-300">
                Topology data is refreshed automatically while the frontend is running.
              </p>
              <div className="mt-4">
                <Button asChild className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  <Link href="/devices">
                    Inspect Devices
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Network className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Nodes</span>
              </div>
              <p className="text-3xl font-bold">{nodes.length}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Visible devices in the topology graph</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <GitBranch className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Links</span>
              </div>
              <p className="text-3xl font-bold">{edges.length}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Connections between SDN elements</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Server className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Active</span>
              </div>
              <p className="text-3xl font-bold">{activeNodes}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Operational nodes discovered in the map</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Cpu className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Switches</span>
              </div>
              <p className="text-3xl font-bold">{switchCount}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Core and access switching devices</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-xl">Live Network Map</CardTitle>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Click on a node to review its summary and position in the topology.
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-gray-100 py-32 dark:bg-gray-950">
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
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-xl">Node Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedNodeDetails ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Identifier</p>
                      <p className="mt-2 font-mono text-sm text-cyan-600 dark:text-cyan-400">{selectedNodeDetails.id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Label</p>
                        <p className="mt-2 text-sm font-semibold">{selectedNodeDetails.label}</p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Type</p>
                        <p className="mt-2 text-sm font-semibold capitalize">{selectedNodeDetails.type}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Status</p>
                      <p className="mt-2 text-sm font-semibold capitalize">{selectedNodeDetails.status}</p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This panel will later receive live details from ONOS and backend endpoints such as ports,
                      statistics, and flow summaries.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                    Select a node from the topology map to inspect its information here.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-xl">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Square className="h-4 w-4 text-cyan-500" />
                  <span>Switch node</span>
                </div>
                <div className="flex items-center gap-3">
                  <Router className="h-4 w-4 text-cyan-300" />
                  <span>Router node</span>
                </div>
                <div className="flex items-center gap-3">
                  <CircleDot className="h-4 w-4 text-teal-500" />
                  <span>Host or endpoint node</span>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <span>Inactive element or degraded path</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-xl">Operational Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>Active nodes: {activeNodes}</p>
                <p>Inactive nodes: {inactiveNodes}</p>
                <p>Use this page to validate graph readability before connecting live ONOS topology data.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
