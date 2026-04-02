"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { TopologyMap } from "@/components/TopologyMap"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useExportPDF } from "@/hooks/useExportPDF"
import {
  sdnApi,
  type ApiPort,
  type LinkLoadResponse,
  type TopologyEdge,
  type TopologyLayoutMode,
  type TopologyNode,
  type TopologyPathResponse,
} from "@/services/api"
import { AlertCircle, ArrowRight, CircleDot, Download, Gauge, GitBranch, Network, RefreshCw, Router, Search, Square } from "lucide-react"

const HOT = 70
const WARM = 40

function n(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function pct(value: unknown) {
  const parsed = n(value)
  if (parsed === null) return null
  return parsed >= 0 && parsed <= 1 ? Math.round(parsed * 1000) / 10 : Math.min(100, Math.max(0, Math.round(parsed * 10) / 10))
}

function loadState(utilization: number | null): NonNullable<TopologyEdge["loadState"]> {
  if (utilization === null) return "unknown"
  if (utilization >= HOT) return "hot"
  if (utilization >= WARM) return "warm"
  return "nominal"
}

function fmtPct(value: number | null) {
  return value === null ? "n/a" : `${value.toFixed(value >= 10 ? 0 : 1)}%`
}

function fmtBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  let current = value
  let index = 0
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024
    index += 1
  }
  return `${current.toFixed(current >= 100 ? 0 : 1)} ${units[index]}`
}

function tone(state: NonNullable<TopologyEdge["loadState"]>) {
  if (state === "hot") return { badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300", bar: "bg-red-500" }
  if (state === "warm") return { badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300", bar: "bg-amber-500" }
  if (state === "nominal") return { badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300", bar: "bg-emerald-500" }
  return { badge: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300", bar: "bg-slate-500" }
}

function enrichEdges(edges: TopologyEdge[], loads: LinkLoadResponse["links"]) {
  const lookup = new Map<string, { utilization: number | null; throughput: number | null }>()
  loads.forEach((entry) => {
    const key = `${entry.device}|${entry.port}`
    lookup.set(key, {
      utilization: pct(entry.utilization),
      throughput: n((entry.raw as Record<string, unknown>).throughput ?? (entry.raw as Record<string, unknown>).rate ?? (entry.raw as Record<string, unknown>).latest),
    })
  })

  return edges.map((edge) => {
    const left = edge.sourcePort ? lookup.get(`${edge.source}|${edge.sourcePort}`) : null
    const right = edge.targetPort ? lookup.get(`${edge.target}|${edge.targetPort}`) : null
    const utilization = Math.max(left?.utilization ?? -1, right?.utilization ?? -1)
    const throughput = Math.max(left?.throughput ?? -1, right?.throughput ?? -1)
    return {
      ...edge,
      utilization: utilization >= 0 ? utilization : null,
      throughput: throughput >= 0 ? throughput : null,
      loadState: loadState(utilization >= 0 ? utilization : null),
    }
  })
}

export default function TopologyPage() {
  const [nodes, setNodes] = useState<TopologyNode[]>([])
  const [edges, setEdges] = useState<TopologyEdge[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null)
  const [showHosts, setShowHosts] = useState(true)
  const [showLinkLabels, setShowLinkLabels] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [layout, setLayout] = useState<TopologyLayoutMode>("cose")
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [ports, setPorts] = useState<ApiPort[]>([])
  const [portsLoading, setPortsLoading] = useState(false)
  const [pathSource, setPathSource] = useState("")
  const [pathDestination, setPathDestination] = useState("")
  const [pathResult, setPathResult] = useState<TopologyPathResponse | null>(null)
  const [pathLoading, setPathLoading] = useState(false)
  const [pathError, setPathError] = useState<string | null>(null)
  const { exportToPDF } = useExportPDF()

  const fetchTopology = useCallback(async (background = false) => {
    try {
      background ? setRefreshing(true) : setLoading(true)
      setError(null)
      const [topology, loads] = await Promise.all([
        sdnApi.getTopology("onos"),
        sdnApi.getLinkLoad().catch(() => ({ source: "onos" as const, total: 0, links: [] })),
      ])
      setNodes(topology.nodes)
      setEdges(enrichEdges(topology.edges, loads.links))
      setLastSync(new Date().toLocaleTimeString())
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch topology")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void fetchTopology()
    if (!autoRefresh) return
    const interval = setInterval(() => void fetchTopology(true), 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchTopology])

  const visibleNodes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return nodes.filter((node) => {
      if (!showHosts && node.type === "host") return false
      if (!term) return true
      return [node.id, node.label, node.type, node.manufacturer || "", node.mac || "", node.location || "", ...(node.ipAddresses || [])]
        .some((value) => value.toLowerCase().includes(term))
    })
  }, [nodes, searchTerm, showHosts])

  const visibleIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes])
  const visibleEdges = useMemo(() => edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)), [edges, visibleIds])
  const nodeMap = useMemo(() => new Map(visibleNodes.map((node) => [node.id, node])), [visibleNodes])
  const selectedNodeDetails = selectedNode ? nodeMap.get(selectedNode) ?? null : null
  const focusedEdge = (selectedEdge ? visibleEdges.find((edge) => edge.id === selectedEdge) : null) || (hoveredEdge ? visibleEdges.find((edge) => edge.id === hoveredEdge) : null) || null
  const deviceCandidates = useMemo(() => visibleNodes.filter((node) => node.type !== "host"), [visibleNodes])
  const activePath = pathResult?.paths[0] ?? null

  useEffect(() => {
    if (!selectedNodeDetails || selectedNodeDetails.type === "host") {
      setPorts([])
      setPortsLoading(false)
      return
    }

    let cancelled = false
    const deviceId = selectedNodeDetails.id

    async function fetchPorts() {
      try {
        setPortsLoading(true)
        const response = await sdnApi.getDevicePorts(deviceId)
        if (!cancelled) setPorts(response.ports)
      } finally {
        if (!cancelled) setPortsLoading(false)
      }
    }
    void fetchPorts()
    return () => {
      cancelled = true
    }
  }, [selectedNodeDetails])

  const hottestLinks = useMemo(() => [...visibleEdges].filter((edge) => edge.utilization !== null).sort((a, b) => (b.utilization ?? 0) - (a.utilization ?? 0)).slice(0, 4), [visibleEdges])

  const runPathAnalysis = async () => {
    if (!pathSource || !pathDestination || pathSource === pathDestination) {
      setPathError("Choose two different infrastructure devices.")
      return
    }

    try {
      setPathLoading(true)
      setPathError(null)
      setPathResult(await sdnApi.getPaths(pathSource, pathDestination))
    } catch (fetchError) {
      setPathError(fetchError instanceof Error ? fetchError.message : "Failed to compute ONOS path")
      setPathResult(null)
    } finally {
      setPathLoading(false)
    }
  }

  return (
    <AuthenticatedShell mainId="topology-container" contentClassName="max-w-7xl">
      <section className="mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">ONOS Live Topology</Badge>
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">Load aware links</Badge>
              <Badge className="border-white/15 bg-white/10 text-slate-200">{autoRefresh ? "Refresh every 5s" : "Manual refresh"}</Badge>
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">Network Topology Explorer</h1>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
              This view now merges ONOS topology, live link telemetry, device ports and path analysis
              so the technician can inspect the fabric without switching tools.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:min-w-[320px]">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-cyan-200">Last refresh</p>
            <p className="text-2xl font-semibold">{lastSync || "Syncing..."}</p>
            <div className="mt-4 flex flex-col gap-2">
              <Button asChild className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                <Link href="/devices">Inspect Devices<ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <div className="flex gap-2">
                <Button onClick={() => void fetchTopology(true)} variant="outline" className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10" disabled={refreshing}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Refresh
                </Button>
                <Button className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => void exportToPDF("topology-container", `SDN-Topology-${new Date().toISOString().split("T")[0]}.pdf`)}>
                  <Download className="mr-2 h-4 w-4" />Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          <div><h3 className="font-semibold text-red-900 dark:text-red-200">Topology backend error</h3><p className="text-sm text-red-800 dark:text-red-300">{error}</p></div>
        </div>
      )}

      <section className="mb-8">
        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardHeader><CardTitle className="text-xl">Topology Controls</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_220px_220px_220px_220px]">
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="device id, host ip, mac, manufacturer..." className="pl-9" /></div>
              <Select value={layout} onValueChange={(value) => setLayout(value as TopologyLayoutMode)}><SelectTrigger><SelectValue placeholder="Layout" /></SelectTrigger><SelectContent><SelectItem value="cose">Adaptive</SelectItem><SelectItem value="breadthfirst">Hierarchy</SelectItem><SelectItem value="circle">Ring</SelectItem></SelectContent></Select>
              <Select value={pathSource || undefined} onValueChange={setPathSource}><SelectTrigger><SelectValue placeholder="Source device" /></SelectTrigger><SelectContent>{deviceCandidates.map((node) => <SelectItem key={`src-${node.id}`} value={node.id}>{node.label}</SelectItem>)}</SelectContent></Select>
              <Select value={pathDestination || undefined} onValueChange={setPathDestination}><SelectTrigger><SelectValue placeholder="Destination device" /></SelectTrigger><SelectContent>{deviceCandidates.map((node) => <SelectItem key={`dst-${node.id}`} value={node.id}>{node.label}</SelectItem>)}</SelectContent></Select>
              <Button onClick={() => void runPathAnalysis()} disabled={pathLoading || !pathSource || !pathDestination || pathSource === pathDestination}><GitBranch className={`mr-2 h-4 w-4 ${pathLoading ? "animate-spin" : ""}`} />Analyze path</Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950"><div><p className="text-sm font-semibold">Show hosts</p><p className="text-xs text-gray-500 dark:text-gray-400">Include ONOS hosts and access links.</p></div><Switch checked={showHosts} onCheckedChange={setShowHosts} /></div>
              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950"><div><p className="text-sm font-semibold">Show link labels</p><p className="text-xs text-gray-500 dark:text-gray-400">Display ports on the graph.</p></div><Switch checked={showLinkLabels} onCheckedChange={setShowLinkLabels} /></div>
              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950"><div><p className="text-sm font-semibold">Live refresh</p><p className="text-xs text-gray-500 dark:text-gray-400">Refresh topology every 5 seconds.</p></div><Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} /></div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80"><CardContent className="pt-6"><div className="mb-3 flex items-center justify-between"><Network className="h-5 w-5 text-cyan-600 dark:text-cyan-400" /><span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Nodes</span></div><p className="text-3xl font-bold">{visibleNodes.length}</p></CardContent></Card>
        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80"><CardContent className="pt-6"><div className="mb-3 flex items-center justify-between"><GitBranch className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /><span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Links</span></div><p className="text-3xl font-bold">{visibleEdges.length}</p></CardContent></Card>
        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80"><CardContent className="pt-6"><div className="mb-3 flex items-center justify-between"><Gauge className="h-5 w-5 text-red-600 dark:text-red-400" /><span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Hot links</span></div><p className="text-3xl font-bold">{visibleEdges.filter((edge) => (edge.utilization ?? 0) >= HOT).length}</p></CardContent></Card>
        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80"><CardContent className="pt-6"><div className="mb-3 flex items-center justify-between"><CircleDot className="h-5 w-5 text-violet-600 dark:text-violet-400" /><span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Hosts</span></div><p className="text-3xl font-bold">{visibleNodes.filter((node) => node.type === "host").length}</p></CardContent></Card>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader><CardTitle className="text-xl">Live Network Map</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-gray-100 py-32 dark:bg-gray-950"><p className="text-gray-500 dark:text-gray-400">Loading topology...</p></div>
              ) : (
                <TopologyMap
                  nodes={visibleNodes}
                  edges={visibleEdges}
                  selectedNode={selectedNode}
                  selectedEdge={selectedEdge}
                  onNodeClick={(nodeId) => { setSelectedNode(nodeId); setSelectedEdge(null) }}
                  onEdgeClick={(edgeId) => { setSelectedEdge(edgeId); if (edgeId) setSelectedNode(null) }}
                  onEdgeHover={setHoveredEdge}
                  onMapBackgroundClick={() => { setSelectedNode(null); setSelectedEdge(null); setHoveredEdge(null) }}
                  layout={layout}
                  showEdgeLabels={showLinkLabels}
                  highlightedNodeIds={activePath?.nodes || []}
                  highlightedEdgeIds={activePath?.edgeRefs || []}
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader><CardTitle className="text-xl">Hottest Links</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {hottestLinks.length > 0 ? hottestLinks.map((edge) => {
                const colors = tone(edge.loadState || "unknown")
                return (
                  <button key={edge.id} type="button" onClick={() => { setSelectedEdge(edge.id); setSelectedNode(null) }} className="w-full rounded-2xl border border-gray-200 p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50 dark:border-gray-800 dark:hover:border-cyan-700 dark:hover:bg-cyan-950/40">
                    <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{nodeMap.get(edge.source)?.label || edge.source} {"->"} {nodeMap.get(edge.target)?.label || edge.target}</p><Badge className={colors.badge}>{fmtPct(edge.utilization ?? null)}</Badge></div>
                    <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-800"><div className={`h-2 rounded-full ${colors.bar}`} style={{ width: `${Math.max(4, edge.utilization ?? 4)}%` }} /></div>
                  </button>
                )
              }) : <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-400">No live link telemetry is available for the current filtered view.</div>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader><CardTitle className="text-xl">Node Details</CardTitle></CardHeader>
            <CardContent>
              {selectedNodeDetails ? (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950"><p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Identifier</p><p className="mt-2 font-mono text-sm text-cyan-600 dark:text-cyan-400">{selectedNodeDetails.id}</p></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950"><p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Label</p><p className="mt-2 text-sm font-semibold">{selectedNodeDetails.label}</p></div>
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950"><p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Type</p><p className="mt-2 text-sm font-semibold capitalize">{selectedNodeDetails.type}</p></div>
                  </div>
                  {selectedNodeDetails.type !== "host" && <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setPathSource(selectedNodeDetails.id)}>Use as source</Button><Button variant="outline" onClick={() => setPathDestination(selectedNodeDetails.id)}>Use as destination</Button></div>}
                  {selectedNodeDetails.type !== "host" && (
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                      <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">Live ports</p><Badge variant="outline">{ports.length} ports</Badge></div>
                      {portsLoading ? <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading ports...</p> : (
                        <div className="mt-3 space-y-2">{ports.slice().sort((a, b) => b.rxBytes + b.txBytes - (a.rxBytes + a.txBytes)).slice(0, 4).map((port) => <div key={`${selectedNodeDetails.id}-${port.portNumber}`} className="rounded-xl border border-gray-200 bg-white p-3 text-xs dark:border-gray-800 dark:bg-gray-900"><div className="flex items-center justify-between gap-2"><span className="font-semibold">Port {port.portNumber}</span><Badge variant="outline">{port.live ? "live" : "down"}</Badge></div><div className="mt-2 grid grid-cols-2 gap-2 text-gray-500 dark:text-gray-400"><span>RX {fmtBytes(port.rxBytes)}</span><span>TX {fmtBytes(port.txBytes)}</span></div></div>)}</div>
                      )}
                    </div>
                  )}
                </div>
              ) : <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-400">Select a node from the map to inspect its inventory data and live ports.</div>}
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader><CardTitle className="text-xl">Link Insight</CardTitle></CardHeader>
            <CardContent>
              {focusedEdge ? (() => {
                const colors = tone(focusedEdge.loadState || "unknown")
                return (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                      <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{nodeMap.get(focusedEdge.source)?.label || focusedEdge.source} {"->"} {nodeMap.get(focusedEdge.target)?.label || focusedEdge.target}</p><Badge className={colors.badge}>{fmtPct(focusedEdge.utilization ?? null)}</Badge></div>
                      <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-800"><div className={`h-2 rounded-full ${colors.bar}`} style={{ width: `${Math.max(4, focusedEdge.utilization ?? 4)}%` }} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950"><p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Ports</p><p className="mt-2 text-sm font-semibold">{focusedEdge.sourcePort || "?"} {"->"} {focusedEdge.targetPort || "?"}</p></div>
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950"><p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Kind</p><p className="mt-2 text-sm font-semibold capitalize">{focusedEdge.kind || "unknown"}</p></div>
                    </div>
                  </div>
                )
              })() : <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-400">Hover or click a link to inspect utilization and ports.</div>}
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader><CardTitle className="text-xl">Path Analysis</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {pathError && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">{pathError}</div>}
              {activePath ? <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{pathSource} {"->"} {pathDestination}</p><Badge variant="outline">{activePath.summary}</Badge></div><p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{activePath.nodes.join(" -> ")}</p></div> : <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-400">Choose two infrastructure devices, then run ONOS path analysis to highlight the computed route directly on the map.</div>}
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader><CardTitle className="text-xl">Legend</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><Square className="h-4 w-4 text-cyan-500" /><span>Switch node</span></div>
              <div className="flex items-center gap-3"><Router className="h-4 w-4 text-cyan-300" /><span>Router node</span></div>
              <div className="flex items-center gap-3"><CircleDot className="h-4 w-4 text-teal-500" /><span>Host or endpoint node</span></div>
              <div className="flex items-center gap-3"><Gauge className="h-4 w-4 text-red-500" /><span>Green, amber and red links reflect ONOS load telemetry</span></div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AuthenticatedShell>
  )
}
