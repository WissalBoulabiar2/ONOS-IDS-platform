'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { apiClient } from '@/lib/api';
import ReactFlow, {
  Node, Edge, Background, Controls, MiniMap,
  useNodesState, useEdgesState, BackgroundVariant,
  EdgeProps, getBezierPath, BaseEdge, Handle, Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Server, Monitor, RefreshCw, Wifi, WifiOff,
  X, ToggleLeft, ToggleRight, GitBranch,
  Activity, Gauge, Search, Settings
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────
interface TopoLink {
  id: string;
  src_device: string;
  src_port: string;
  dst_device: string;
  dst_port: string;
  type: string;
  state: string;
  is_enabled: boolean;
  changed_at?: string;
}

interface PortStat {
  port: string;
  bytesReceived: number;
  bytesSent: number;
  throughput_bps: number;
  utilization: number;
  live: boolean;
}

interface DeviceStats {
  device: string;
  ports: PortStat[];
}

function fmtBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let val = bytes;
  let i = 0;
  while (val >= 1024 && i < units.length - 1) { val /= 1024; i++; }
  return `${val.toFixed(1)} ${units[i]}`;
}

// ── Custom Nodes ──────────────────────────────────────────────
function SwitchNode({ data }: { data: any }) {
  const isActive = data.status === 'active';
  const hasStats = data.totalBytes > 0;
  return (
    <div className={`rounded-xl border-2 px-3 py-2.5 text-center shadow-lg min-w-[120px] ${
      isActive ? 'border-cyan-500 bg-slate-900 shadow-cyan-500/20' : 'border-slate-600 bg-slate-800 opacity-60'
    } ${data.highlighted ? 'border-yellow-400 shadow-yellow-400/30' : ''}`}>
      <Handle type="target" position={Position.Top} style={{ background: '#06b6d4', border: 'none', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#06b6d4', border: 'none', width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} style={{ background: '#06b6d4', border: 'none', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#06b6d4', border: 'none', width: 8, height: 8 }} />
      <div className={`mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-lg ${isActive ? 'bg-cyan-700' : 'bg-slate-700'}`}>
        <Server className="h-4 w-4 text-white" />
      </div>
      <p className="text-[10px] font-semibold text-white truncate max-w-[100px]">
        {data.label.replace('of:00000000000000', 'SW-')}
      </p>
      <p className="text-[9px] text-slate-400">{data.sw_version || data.type}</p>
      {hasStats && (
        <p className="text-[8px] text-cyan-400 mt-0.5">{fmtBytes(data.totalBytes)}/s</p>
      )}
      <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-[8px]">{data.status}</span>
      </div>
    </div>
  );
}

function HostNode({ data }: { data: any }) {
  return (
    <div className={`rounded-xl border-2 border-slate-600 bg-slate-800 px-2.5 py-2 text-center min-w-[85px] ${
      data.highlighted ? 'border-yellow-400' : ''
    }`}>
      <Handle type="target" position={Position.Top} style={{ background: '#475569', border: 'none' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#475569', border: 'none' }} />
      <Handle type="target" position={Position.Left} style={{ background: '#475569', border: 'none' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#475569', border: 'none' }} />
      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-700">
        <Monitor className="h-3.5 w-3.5 text-slate-300" />
      </div>
      <p className="text-[9px] font-semibold text-white">{data.ip || 'Host'}</p>
      <p className="text-[8px] text-slate-500">{data.mac?.slice(0, 8)}...</p>
    </div>
  );
}

function ClickableEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style }: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <BaseEdge path={edgePath} style={style} />
      <path d={edgePath} fill="none" strokeWidth={20} stroke="transparent" style={{ cursor: 'pointer' }} onClick={() => data?.onEdgeClick?.(data)} />
      <foreignObject x={labelX - 25} y={labelY - 8} width={50} height={16}>
        <div onClick={() => data?.onEdgeClick?.(data)} style={{ cursor: 'pointer' }}
          className={`text-center text-[8px] rounded px-0.5 ${data?.is_enabled ? 'text-cyan-400 bg-slate-900/80' : 'text-red-400 bg-slate-900/80'}`}>
          {data?.src_port}↔{data?.dst_port}
        </div>
      </foreignObject>
    </>
  );
}

const nodeTypes = { switch: SwitchNode, host: HostNode };
const edgeTypes = { clickable: ClickableEdge };

function layoutNodes(switches: any[], hosts: any[], statsMap: Map<string, DeviceStats>): Node[] {
  const cx = 500, cy = 300, r = 200;
  const switchNodes: Node[] = switches.map((sw, i) => {
    const angle = (i / switches.length) * 2 * Math.PI - Math.PI / 2;
    const deviceStats = statsMap.get(sw.id);
    const totalBytes = deviceStats ? deviceStats.ports.reduce((sum, p) => sum + p.throughput_bps, 0) : 0;
    return {
      id: sw.id, type: 'switch',
      position: { x: cx + r * Math.cos(angle) - 60, y: cy + r * Math.sin(angle) - 40 },
      data: { ...sw, totalBytes, highlighted: false },
    };
  });
  const hostNodes: Node[] = hosts.map((h, i) => {
    const angle = (i / Math.max(hosts.length, 1)) * 2 * Math.PI;
    return {
      id: h.id, type: 'host',
      position: { x: cx + (r + 150) * Math.cos(angle) - 42, y: cy + (r + 150) * Math.sin(angle) - 28 },
      data: { ...h, highlighted: false },
    };
  });
  return [...switchNodes, ...hostNodes];
}

function buildEdges(links: TopoLink[], hostEdges: any[], onEdgeClick: (data: any) => void, highlightedEdgeIds: string[]): Edge[] {
  const switchEdges = links.map(lnk => ({
    id: lnk.id,
    source: lnk.src_device,
    target: lnk.dst_device,
    type: 'clickable',
    zIndex: 10,
    style: {
      stroke: highlightedEdgeIds.includes(lnk.id) ? '#facc15' :
        lnk.is_enabled ? '#06b6d4' : '#ef4444',
      strokeWidth: highlightedEdgeIds.includes(lnk.id) ? 4 : 2,
      strokeDasharray: lnk.is_enabled ? undefined : '5 5',
    },
    data: { src_port: lnk.src_port, dst_port: lnk.dst_port, is_enabled: lnk.is_enabled, src_device: lnk.src_device, dst_device: lnk.dst_device, onEdgeClick },
  }));

  const hEdges = hostEdges.filter(h => h.location_device && h.location_port).map(h => ({
    id: `host-${h.id}`,
    source: h.location_device,
    target: h.id,
    style: { stroke: '#475569', strokeWidth: 1.5, strokeDasharray: '4 4' },
    label: `p${h.location_port}`,
    labelStyle: { fill: '#64748b', fontSize: 8 },
    labelBgStyle: { fill: '#0f172a' },
    data: { src_device: h.location_device, src_port: h.location_port, dst_device: h.id, dst_port: '0', is_enabled: true, is_host_link: true, onEdgeClick },
  }));

  return [...switchEdges, ...hEdges];
}

// ── Page ──────────────────────────────────────────────────────
export default function TopologyPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const linksRef = useRef<TopoLink[]>([]);
  const handleEdgeClickRef = useRef<(data: any) => void>(() => {});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stats, setStats] = useState({ switches: 0, hosts: 0, links: 0 });
  const [portStats, setPortStats] = useState<Map<string, DeviceStats>>(new Map());
  const [selectedLink, setSelectedLink] = useState<TopoLink | null>(null);
  const [toggling, setToggling] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Path analysis
  const [pathSrc, setPathSrc] = useState('');
  const [pathDst, setPathDst] = useState('');
  const [pathLoading, setPathLoading] = useState(false);
  const [pathResult, setPathResult] = useState<any>(null);
  const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

  // Selected node details
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [switchList, setSwitchList] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  const handleEdgeClick = useCallback((data: any) => {
    const link = linksRef.current.find(l =>
      (l.src_device === data.src_device && l.src_port === data.src_port) ||
      (l.dst_device === data.src_device && l.dst_port === data.src_port)
    );
    if (link) setSelectedLink(link);
    else if (data.is_host_link) {
      setSelectedLink({
        id: `host-${data.dst_device}`,
        src_device: data.src_device, src_port: data.src_port,
        dst_device: data.dst_device, dst_port: '0',
        type: 'HOST', state: 'ACTIVE', is_enabled: data.is_enabled ?? true,
      });
    }
  }, []);

  handleEdgeClickRef.current = handleEdgeClick;

  const fetchTopology = useCallback(async () => {
    setLoading(true);
    try {
      const [topoRes, linksRes, statsRes] = await Promise.all([
        apiClient('/topology'),
        apiClient('/topology/links'),
        apiClient('/topology/stats/ports').catch(() => null),
      ]);

      if (topoRes.ok && linksRes.ok) {
        const topo = await topoRes.json();
        const linksData = await linksRes.json();
        const fetchedLinks: TopoLink[] = linksData.links || [];
        linksRef.current = fetchedLinks;

        // Port stats
        let statsMap = new Map<string, DeviceStats>();
        if (statsRes?.ok) {
          const statsData = await statsRes.json();
          (statsData.statistics || []).forEach((s: DeviceStats) => {
            statsMap.set(s.device, s);
          });
          setPortStats(statsMap);
        }

        setSwitchList(topo.nodes);
        const n = layoutNodes(topo.nodes, topo.hosts, statsMap);
        const e = buildEdges(fetchedLinks, topo.hosts, (data) => handleEdgeClickRef.current(data), highlightedEdges);

        setNodes(n);
        setEdges(e);
        setLastUpdated(new Date());
        setStats({ switches: topo.nodes.length, hosts: topo.hosts.length, links: fetchedLinks.length });
      }
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges, highlightedEdges]);

  useEffect(() => {
    if (user) fetchTopology();
  }, [user]); // eslint-disable-line

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchTopology(), 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTopology]);

  const runPathAnalysis = async () => {
    if (!pathSrc || !pathDst || pathSrc === pathDst) return;
    setPathLoading(true);
    setPathResult(null);
    setHighlightedEdges([]);
    setHighlightedNodes([]);
    try {
      const res = await apiClient(`/topology/paths/${pathSrc}/${pathDst}`);
      if (res.ok) {
        const data = await res.json();
        setPathResult(data);
        if (data.found && data.paths[0]) {
          setHighlightedEdges(data.paths[0].edge_refs || []);
          setHighlightedNodes(data.paths[0].nodes || []);
        }
      }
    } finally {
      setPathLoading(false);
    }
  };

  const clearPath = () => {
    setPathResult(null);
    setHighlightedEdges([]);
    setHighlightedNodes([]);
    setPathSrc('');
    setPathDst('');
  };

  const toggleLink = async () => {
    if (!selectedLink || !['admin', 'manager'].includes(user?.role ?? '')) return;
    setToggling(true);
    try {
      const res = await apiClient('/topology/links/toggle', {
        method: 'POST',
        body: JSON.stringify({
          src_device: selectedLink.src_device,
          src_port: selectedLink.src_port,
          dst_device: selectedLink.dst_device,
          dst_port: selectedLink.dst_port,
          enable: !selectedLink.is_enabled,
        }),
      });
      if (res.ok) { setSelectedLink(null); setTimeout(() => fetchTopology(), 1000); }
    } finally { setToggling(false); }
  };

  if (isLoading || !user) return null;
  const canToggle = ['admin', 'manager'].includes(user.role);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-3">
        <div>
          <h1 className="text-lg font-bold text-white">Network Topology</h1>
          <p className="text-xs text-slate-400">Live from ONOS · Click links to toggle</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Server className="h-3.5 w-3.5 text-cyan-400" />
              <span className="font-medium text-white">{stats.switches}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Monitor className="h-3.5 w-3.5" />
              <span className="font-medium text-white">{stats.hosts}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Wifi className="h-3.5 w-3.5 text-blue-400" />
              <span className="font-medium text-white">{stats.links}</span>
            </span>
          </div>
          {lastUpdated && <span className="text-xs text-slate-500">{lastUpdated.toLocaleTimeString()}</span>}
          {/* Auto refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs transition-colors ${
              autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Activity className="h-3 w-3" />
            {autoRefresh ? 'Live 5s' : 'Manual'}
          </button>
          <button onClick={() => fetchTopology()} disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Path Analysis Bar */}
      <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-950/50 px-6 py-2">
        <GitBranch className="h-4 w-4 text-purple-400 shrink-0" />
        <span className="text-xs text-slate-400 shrink-0">Path Analysis:</span>
        <select value={pathSrc} onChange={e => setPathSrc(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500">
          <option value="">Source switch</option>
          {switchList.map(sw => (
            <option key={sw.id} value={sw.id}>
              {sw.id.replace('of:00000000000000', 'SW-')}
            </option>
          ))}
        </select>
        <span className="text-slate-600">→</span>
        <select value={pathDst} onChange={e => setPathDst(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500">
          <option value="">Destination switch</option>
          {switchList.map(sw => (
            <option key={sw.id} value={sw.id}>
              {sw.id.replace('of:00000000000000', 'SW-')}
            </option>
          ))}
        </select>
        <button onClick={runPathAnalysis} disabled={pathLoading || !pathSrc || !pathDst || pathSrc === pathDst}
          className="flex items-center gap-1.5 rounded-lg bg-purple-700/80 px-3 py-1 text-xs text-white hover:bg-purple-600 disabled:opacity-50">
          <GitBranch className={`h-3 w-3 ${pathLoading ? 'animate-spin' : ''}`} />
          Analyze
        </button>
        {pathResult && (
          <>
            <span className={`text-xs ${pathResult.found ? 'text-green-400' : 'text-red-400'}`}>
              {pathResult.found
                ? `✓ ${pathResult.paths[0]?.summary} — ${pathResult.paths[0]?.nodes.map((n: string) => n.replace('of:00000000000000', 'SW-')).join(' → ')}`
                : '✗ No path found'
              }
            </span>
            <button onClick={clearPath} className="text-xs text-slate-500 hover:text-white">Clear</button>
          </>
        )}
        {canToggle && (
          <span className="ml-auto text-xs text-cyan-400">Click a link to toggle it</span>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 border-b border-slate-800 bg-slate-950/30 px-6 py-1.5">
        <span className="text-[10px] text-slate-500">Legend:</span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400">
          <span className="inline-block h-0.5 w-5 bg-cyan-400" /> Active
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400">
          <span className="inline-block h-0.5 w-5 bg-red-400 opacity-60" /> Disabled
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400">
          <span className="inline-block h-0.5 w-5 bg-yellow-400" /> Path highlight
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400">
          <span className="inline-block h-0.5 w-5 border-t border-dashed border-slate-500" /> Host link
        </span>
      </div>

      {/* Graph + Side Panel */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
                <p className="text-sm text-slate-400">Loading topology from ONOS...</p>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes} edges={edges}
              onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes} edgeTypes={edgeTypes}
              onNodeClick={(_, node) => setSelectedNode(node.data)}
              onPaneClick={() => setSelectedNode(null)}
              fitView fitViewOptions={{ padding: 0.3 }}
              minZoom={0.3} maxZoom={2}
              defaultEdgeOptions={{ zIndex: 10 }}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1e293b" />
              <Controls />
              <MiniMap style={{ background: '#0f172a', border: '1px solid #1e293b' }}
                nodeColor={n => n.type === 'switch' ? '#06b6d4' : '#475569'} />
            </ReactFlow>
          )}
        </div>

        {/* Side Panel — Node Details + Port Stats */}
        {selectedNode && (
          <div className="w-64 shrink-0 border-l border-slate-800 bg-slate-950 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Device Detail</h3>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-900 p-3">
                <p className="text-slate-500 mb-1">ONOS ID</p>
                <p className="font-mono text-cyan-400 break-all text-[10px]">{selectedNode.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-900 p-2">
                  <p className="text-slate-500">Status</p>
                  <span className={`inline-block mt-1 rounded-md px-1.5 py-0.5 text-[10px] ${
                    selectedNode.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>{selectedNode.status}</span>
                </div>
                <div className="rounded-xl bg-slate-900 p-2">
                  <p className="text-slate-500">Version</p>
                  <p className="text-white mt-1">{selectedNode.sw_version || '—'}</p>
                </div>
              </div>

              {/* Port Stats */}
              {portStats.has(selectedNode.id) && (
                <div>
                  <p className="text-slate-500 mb-2 flex items-center gap-1">
                    <Gauge className="h-3 w-3" /> Live Ports
                  </p>
                  <div className="space-y-1.5">
                    {portStats.get(selectedNode.id)!.ports.map(port => (
                      <div key={port.port} className="rounded-lg bg-slate-900 px-2.5 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white">Port {port.port}</span>
                          <span className={`rounded text-[9px] px-1 ${port.live ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'}`}>
                            {port.live ? 'live' : 'down'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-400">
                          <span>RX {fmtBytes(port.bytesReceived)}</span>
                          <span>TX {fmtBytes(port.bytesSent)}</span>
                        </div>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-cyan-500"
                            style={{ width: `${Math.max(port.utilization, 1)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Use as path endpoint */}
              {canToggle && (
                <div className="space-y-1.5 pt-1">
                  <button onClick={() => setPathSrc(selectedNode.id)}
                    className="w-full rounded-lg bg-purple-700/20 px-2 py-1.5 text-[10px] text-purple-400 hover:bg-purple-700/30">
                    Set as path source
                  </button>
                  <button onClick={() => setPathDst(selectedNode.id)}
                    className="w-full rounded-lg bg-purple-700/20 px-2 py-1.5 text-[10px] text-purple-400 hover:bg-purple-700/30">
                    Set as path destination
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal toggle lien */}
      {selectedLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-white">Network Link</h3>
              <button onClick={() => setSelectedLink(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-5 space-y-3 text-sm">
              <div className="rounded-xl bg-slate-800 p-3">
                <p className="mb-1 text-xs text-slate-500">Source</p>
                <p className="font-mono text-xs text-white">
                  {selectedLink.src_device.replace('of:00000000000000', 'SW-')}
                  <span className="text-cyan-400"> : port {selectedLink.src_port}</span>
                </p>
              </div>
              <div className="rounded-xl bg-slate-800 p-3">
                <p className="mb-1 text-xs text-slate-500">Destination</p>
                <p className="font-mono text-xs text-white">
                  {selectedLink.type === 'HOST'
                    ? `Host ${selectedLink.dst_device.split('/')[0]}`
                    : selectedLink.dst_device.replace('of:00000000000000', 'SW-')
                  }
                  <span className="text-cyan-400"> : port {selectedLink.dst_port}</span>
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-800 p-3">
                <span className="text-xs text-slate-400">Current state</span>
                <span className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs ${
                  selectedLink.is_enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {selectedLink.is_enabled ? <><Wifi className="h-3 w-3" /> Enabled</> : <><WifiOff className="h-3 w-3" /> Disabled</>}
                </span>
              </div>
            </div>
            {canToggle ? (
              <div className="flex gap-3">
                <button onClick={() => setSelectedLink(null)}
                  className="flex-1 rounded-xl bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                  Cancel
                </button>
                <button onClick={toggleLink} disabled={toggling}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors disabled:opacity-50 ${
                    selectedLink.is_enabled ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}>
                  {toggling ? <RefreshCw className="h-4 w-4 animate-spin" /> :
                    selectedLink.is_enabled ? <><ToggleLeft className="h-4 w-4" /> Disable</> : <><ToggleRight className="h-4 w-4" /> Enable</>
                  }
                </button>
              </div>
            ) : (
              <p className="text-center text-xs text-slate-500">Admin or Manager required</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}