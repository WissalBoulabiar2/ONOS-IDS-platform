"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { TopologyMap } from "@/components/TopologyMap"
import { useExportPDF } from "@/hooks/useExportPDF"
import {
  sdnApi,
  type TopologyEdge,
  type TopologyLayoutMode,
  type TopologyNode,
} from "@/services/api"
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CircleDot,
  Download,
  GitBranch,
  Network,
  RefreshCw,
  Router,
  Search,
  Server,
  Square,
} from "lucide-react"

export default function TopologyPage() {
  const [nodes, setNodes] = useState<TopologyNode[]>([])
  const [edges, setEdges] = useState<TopologyEdge[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<"database" | "onos">("onos")
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [layout, setLayout] = useState<TopologyLayoutMode>("cose")
  const [showHosts, setShowHosts] = useState(true)
  const [showLinkLabels, setShowLinkLabels] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { exportToPDF } = useExportPDF()

  const fetchTopology = useCallback(async (background = false) => {
    try {
      if (background) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const data = await sdnApi.getTopology("onos")
      setNodes(data.nodes)
      setEdges(data.edges)
      setDataSource(data.source)
      setLastSync(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch topology")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchTopology()

    if (!autoRefresh) {
      return
    }

    const interval = setInterval(() => {
      fetchTopology(true)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh, fetchTopology])

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const visibleNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (!showHosts && node.type === "host") {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const searchableValues = [
        node.id,
        node.label,
        node.type,
        node.manufacturer || "",
        node.serialNumber || "",
        node.hwVersion || "",
        node.swVersion || "",
        node.mac || "",
        node.location || "",
        ...(node.ipAddresses || []),
      ]

      return searchableValues.some((value) => value.toLowerCase().includes(normalizedSearch))
    })
  }, [nodes, normalizedSearch, showHosts])

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes])

  const visibleEdges = useMemo(
    () =>
      edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)),
    [edges, visibleNodeIds]
  )

  useEffect(() => {
    if (selectedNode && !visibleNodeIds.has(selectedNode)) {
      setSelectedNode(null)
    }
  }, [selectedNode, visibleNodeIds])

  const selectedNodeDetails = useMemo(
    () => visibleNodes.find((node) => node.id === selectedNode) ?? null,
    [visibleNodes, selectedNode]
  )

  const selectedNodeLinkCount = useMemo(() => {
    if (!selectedNodeDetails) {
      return 0
    }

    return visibleEdges.filter(
      (edge) => edge.source === selectedNodeDetails.id || edge.target === selectedNodeDetails.id
    ).length
  }, [selectedNodeDetails, visibleEdges])

  const activeNodes = visibleNodes.filter((node) => node.status === "active").length
  const inactiveNodes = visibleNodes.length - activeNodes
  const hostCount = visibleNodes.filter((node) => node.type === "host").length
  const hiddenNodeCount = nodes.length - visibleNodes.length

  const handleExportTopology = async () => {
    try {
      setExporting(true)
      await exportToPDF("topology-container", `SDN-Topology-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (exportError) {
      // Silently handle export errors
    } finally {
      setExporting(false)
    }
  }

  return (
    <AuthenticatedShell mainId="topology-container" contentClassName="max-w-7xl">
        <section className="mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                  Interactive Map
                </Badge>
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  {dataSource === "onos" ? "Direct ONOS" : "Database Snapshot"}
                </Badge>
                <Badge className="border-white/15 bg-white/10 text-slate-200">
                  {autoRefresh ? "Auto refresh every 5s" : "Manual refresh"}
                </Badge>
              </div>
              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
                Network Topology Explorer
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                This view now reads topology directly from ONOS. PostgreSQL stays useful for history,
                alerts and reports, but the live graph is no longer served from the database first.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:min-w-[320px]">
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-cyan-200">Last refresh</p>
              <p className="text-2xl font-semibold">{lastSync || "Syncing..."}</p>
              <p className="mt-2 text-sm text-slate-300">
                Devices, infrastructure links and hosts are loaded live from ONOS through the secured
                backend.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  <Link href="/devices">
                    Inspect Devices
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={() => fetchTopology(true)}
                    variant="outline"
                    className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10"
                    disabled={refreshing}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button
                    onClick={handleExportTopology}
                    disabled={exporting}
                    className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Download className={`mr-2 h-4 w-4 ${exporting ? "animate-spin" : ""}`} />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">Topology backend error</h3>
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        <section className="mb-8">
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-xl">Topology Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_220px_180px]">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Search node or host
                  </p>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="device id, host ip, mac, manufacturer..."
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Graph layout
                  </p>
                  <Select value={layout} onValueChange={(value) => setLayout(value as TopologyLayoutMode)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cose">Adaptive</SelectItem>
                      <SelectItem value="breadthfirst">Hierarchy</SelectItem>
                      <SelectItem value="circle">Ring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchTerm("")
                      setShowHosts(true)
                      setShowLinkLabels(true)
                      setAutoRefresh(true)
                      setLayout("cose")
                    }}
                  >
                    Reset filters
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                  <div>
                    <p className="text-sm font-semibold">Show hosts</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Include ONOS host nodes and access links.
                    </p>
                  </div>
                  <Switch checked={showHosts} onCheckedChange={setShowHosts} />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                  <div>
                    <p className="text-sm font-semibold">Show port labels</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Display edge ports and link type on the map.
                    </p>
                  </div>
                  <Switch checked={showLinkLabels} onCheckedChange={setShowLinkLabels} />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                  <div>
                    <p className="text-sm font-semibold">Auto refresh</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Refresh topology snapshot every 5 seconds.
                    </p>
                  </div>
                  <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Network className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  Nodes
                </span>
              </div>
              <p className="text-3xl font-bold">{visibleNodes.length}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Visible nodes from the current ONOS snapshot
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <GitBranch className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  Links
                </span>
              </div>
              <p className="text-3xl font-bold">{visibleEdges.length}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Infrastructure and host access links in view
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Server className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  Active
                </span>
              </div>
              <p className="text-3xl font-bold">{activeNodes}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Visible elements currently marked active
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <CircleDot className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  Hosts
                </span>
              </div>
              <p className="text-3xl font-bold">{hostCount}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                ONOS hosts currently included in the graph
              </p>
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
                      Search, filter and change the layout to read the ONOS topology more clearly.
                    </p>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    Source locked to ONOS
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-gray-100 py-32 dark:bg-gray-950">
                    <p className="text-gray-500 dark:text-gray-400">Loading topology...</p>
                  </div>
                ) : (
                  <TopologyMap
                    nodes={visibleNodes}
                    edges={visibleEdges}
                    selectedNode={selectedNode}
                    onNodeClick={setSelectedNode}
                    layout={layout}
                    showEdgeLabels={showLinkLabels}
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
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                        Identifier
                      </p>
                      <p className="mt-2 font-mono text-sm text-cyan-600 dark:text-cyan-400">
                        {selectedNodeDetails.id}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          Label
                        </p>
                        <p className="mt-2 text-sm font-semibold">{selectedNodeDetails.label}</p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          Type
                        </p>
                        <p className="mt-2 text-sm font-semibold capitalize">{selectedNodeDetails.type}</p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          Status
                        </p>
                        <p className="mt-2 text-sm font-semibold capitalize">{selectedNodeDetails.status}</p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          Connected links
                        </p>
                        <p className="mt-2 text-sm font-semibold">{selectedNodeLinkCount}</p>
                      </div>
                    </div>

                    {selectedNodeDetails.manufacturer && (
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          Manufacturer
                        </p>
                        <p className="mt-2 text-sm font-semibold">{selectedNodeDetails.manufacturer}</p>
                      </div>
                    )}

                    {selectedNodeDetails.location && (
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          Location
                        </p>
                        <p className="mt-2 text-sm font-semibold">{selectedNodeDetails.location}</p>
                      </div>
                    )}

                    {selectedNodeDetails.mac && (
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          MAC
                        </p>
                        <p className="mt-2 font-mono text-sm font-semibold">{selectedNodeDetails.mac}</p>
                      </div>
                    )}

                    {selectedNodeDetails.ipAddresses && selectedNodeDetails.ipAddresses.length > 0 && (
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          IP addresses
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                          {selectedNodeDetails.ipAddresses.join(", ")}
                        </p>
                      </div>
                    )}
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
                  <GitBranch className="h-4 w-4 text-emerald-500" />
                  <span>Access links are dotted, infrastructure links are solid</span>
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
                <p>Current source: {dataSource}</p>
                <p>Visible nodes: {visibleNodes.length} / {nodes.length}</p>
                <p>Visible links: {visibleEdges.length} / {edges.length}</p>
                <p>Inactive visible nodes: {inactiveNodes}</p>
                <p>Hidden by filters: {hiddenNodeCount}</p>
                <p>Layout mode: {layout}</p>
                <p>Auto refresh: {autoRefresh ? "enabled" : "disabled"}</p>
                <p>Database role: history, alerts and reports only</p>
              </CardContent>
            </Card>
          </div>
        </section>
    </AuthenticatedShell>
  )
}
