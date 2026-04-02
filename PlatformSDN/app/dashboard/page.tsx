'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardChatbot } from '@/components/dashboard-chatbot';
import { AuthenticatedShell } from '@/components/layout/authenticated-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExportPDF } from '@/hooks/useExportPDF';
import {
  sdnApi,
  type ApiAlert,
  type ApplicationsResponse,
  type ClusterHealthResponse,
  type DashboardOverviewResponse,
  type DashboardStatsResponse,
  type DeviceMetricsResponse,
  type IntentsResponse,
  type LinkLoadResponse,
  type NetworkHeatmapResponse,
  type NetworkPerformanceResponse,
} from '@/services/api';
import {
  Activity,
  AlertCircle,
  AppWindow,
  BellRing,
  Cpu,
  Download,
  GitBranch,
  Network,
  RefreshCw,
  Server,
  TrendingUp,
  Users,
  Zap,
  Flame,
} from 'lucide-react';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const DASHBOARD_REFRESH_INTERVAL_MS = 15000;

export default function DashboardPage() {
  const [statsResponse, setStatsResponse] = useState<DashboardStatsResponse | null>(null);
  const [metricsResponse, setMetricsResponse] = useState<DeviceMetricsResponse | null>(null);
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [linkLoad, setLinkLoad] = useState<LinkLoadResponse['links']>([]);
  const [recentAlerts, setRecentAlerts] = useState<ApiAlert[]>([]);

  // NEW: Advanced metrics
  const [clusterHealth, setClusterHealth] = useState<ClusterHealthResponse | null>(null);
  const [applications, setApplications] = useState<ApplicationsResponse | null>(null);
  const [intents, setIntents] = useState<IntentsResponse | null>(null);
  const [performance, setPerformance] = useState<NetworkPerformanceResponse | null>(null);
  const [heatmap, setHeatmap] = useState<NetworkHeatmapResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [dataSource, setDataSource] = useState<'database' | 'onos' | 'mixed'>('onos');
  const [exporting, setExporting] = useState(false);
  const refreshInFlightRef = useRef(false);
  const { exportToPDF } = useExportPDF();

  const fetchDashboardData = useCallback(async (background = false) => {
    if (refreshInFlightRef.current) {
      return;
    }

    try {
      refreshInFlightRef.current = true;

      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [
        statsData,
        metricsData,
        overviewData,
        alertsData,
        linkLoadData,
        clusterData,
        appsData,
        intentsData,
        perfData,
        heatmapData,
      ] = await Promise.all([
        sdnApi.getDashboardStats(),
        sdnApi.getDeviceMetrics(),
        sdnApi.getDashboardOverview(),
        sdnApi.getAlerts({ status: 'all', limit: 10 }),
        sdnApi.getLinkLoad().catch(() => ({ source: 'onos' as const, total: 0, links: [] })),
        // NEW CALLS
        sdnApi.getClusterHealth(),
        sdnApi.getApplications(),
        sdnApi.getIntents(),
        sdnApi.getNetworkPerformance(),
        sdnApi.getNetworkHeatmap(),
      ]);

      setStatsResponse(statsData);
      setMetricsResponse(metricsData);
      setOverview(overviewData);
      setRecentAlerts(alertsData.alerts);
      setLinkLoad(linkLoadData.links);

      // NEW: Set advanced metrics
      setClusterHealth(clusterData);
      setApplications(appsData);
      setIntents(intentsData);
      setPerformance(perfData);
      setHeatmap(heatmapData);

      const sources = new Set([
        statsData.source,
        metricsData.source,
        alertsData.source,
        linkLoadData.source,
      ]);
      setDataSource(sources.size === 1 ? (Array.from(sources)[0] as 'database' | 'onos') : 'mixed');
      setLastSyncAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      refreshInFlightRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, DASHBOARD_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setClockNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      await exportToPDF(
        'dashboard-container',
        `SDN-Dashboard-${new Date().toISOString().split('T')[0]}.pdf`
      );
    } catch {
      // Silently handle export errors
    } finally {
      setExporting(false);
    }
  };

  const stats = statsResponse?.stats;
  const devices = useMemo(() => metricsResponse?.metrics ?? [], [metricsResponse]);

  const deviceTypeData = useMemo(
    () =>
      devices.reduce<{ name: string; value: number }[]>((acc, device) => {
        const existing = acc.find((entry) => entry.name === device.type);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: device.type, value: 1 });
        }
        return acc;
      }, []),
    [devices]
  );

  const portStatusData = useMemo(
    () =>
      stats
        ? [
            { name: 'Live', value: stats.live_ports, color: '#10b981' },
            {
              name: 'Enabled standby',
              value: Math.max(stats.enabled_ports - stats.live_ports, 0),
              color: '#f59e0b',
            },
            {
              name: 'Disabled',
              value: Math.max(stats.total_ports - stats.enabled_ports, 0),
              color: '#ef4444',
            },
          ]
        : [],
    [stats]
  );

  const trafficData = useMemo(
    () =>
      devices.slice(0, 8).map((device) => ({
        name: device.device_id.split(':').pop() || device.device_id,
        rx: Math.round(device.total_rx_bytes / (1024 * 1024)),
        tx: Math.round(device.total_tx_bytes / (1024 * 1024)),
      })),
    [devices]
  );

  const intentSummaryEntries = useMemo(() => {
    if (!overview?.intents?.summary) {
      return [];
    }

    return Object.entries(overview.intents.summary)
      .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
      .slice(0, 6);
  }, [overview]);

  const topLoadedLinks = useMemo(
    () =>
      [...linkLoad]
        .filter((entry) => entry.utilization !== null)
        .sort((left, right) => (right.utilization ?? 0) - (left.utilization ?? 0))
        .slice(0, 6),
    [linkLoad]
  );

  const hottestLinkValue = useMemo(
    () => topLoadedLinks.reduce((maxValue, entry) => Math.max(maxValue, entry.utilization ?? 0), 0),
    [topLoadedLinks]
  );

  const metricHighlights = overview?.observability.highlighted || [];
  const vplsServices = overview?.vpls.services || [];

  const lastSyncLabel = useMemo(
    () => formatRelativeSync(lastSyncAt, clockNow),
    [clockNow, lastSyncAt]
  );

  return (
    <AuthenticatedShell mainId="dashboard-container" contentClassName="max-w-7xl">
      <section className="mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                Operations Center
              </Badge>
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                {dataSource === 'database'
                  ? 'PostgreSQL cache'
                  : dataSource === 'onos'
                    ? 'Live ONOS'
                    : 'Mixed sources'}
              </Badge>
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
              PlatformSDN Dashboard
            </h1>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
              Unified controller, topology, traffic, application, and incident visibility for the
              ONOS platform.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:min-w-[320px]">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-cyan-200">
              Controller status
            </p>
            <p className="text-2xl font-semibold">
              {overview?.controller.version || 'Unknown'}
              {overview?.controller.build ? ` (${overview.controller.build})` : ''}
            </p>
            <p className="mt-2 text-sm text-slate-300">Last sync: {lastSyncLabel}</p>
            <p className="mt-1 text-xs text-slate-400">
              Refresh cycle: {Math.round(DASHBOARD_REFRESH_INTERVAL_MS / 1000)} sec with overlap
              protection
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => fetchDashboardData(true)}
                variant="outline"
                disabled={refreshing}
                className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex-1 bg-cyan-600 text-white hover:bg-cyan-700"
              >
                <Download className={`mr-2 h-4 w-4 ${exporting ? 'animate-spin' : ''}`} />
                Export
              </Button>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-200">
              Error fetching dashboard data
            </h3>
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <SummaryCard
          title="Devices"
          value={stats?.total_devices || 0}
          description={`${stats?.online_devices || 0} online`}
          icon={<Server className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
        />
        <SummaryCard
          title="Live Ports"
          value={stats?.live_ports || 0}
          description={`${stats?.enabled_ports || 0} enabled`}
          icon={<Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        />
        <SummaryCard
          title="Flows"
          value={stats?.total_flows || 0}
          description="Installed policy entries"
          icon={<TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        />
        <SummaryCard
          title="Hosts"
          value={overview?.hosts.total || 0}
          description="Discovered endpoints"
          icon={<Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
        />
        <SummaryCard
          title="Apps"
          value={overview?.applications.active || 0}
          description={`${overview?.applications.total || 0} installed`}
          icon={<AppWindow className="h-5 w-5 text-sky-600 dark:text-sky-400" />}
        />
        <SummaryCard
          title="Alerts"
          value={stats?.active_alerts || 0}
          description="Open incidents"
          icon={<BellRing className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
        />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardHeader>
            <CardTitle>Controller & Cluster</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MiniMetric label="Version" value={overview?.controller.version || 'Unknown'} />
              <MiniMetric label="Uptime" value={overview?.controller.uptime || 'N/A'} />
              <MiniMetric label="Cluster Nodes" value={String(overview?.cluster.total || 0)} />
              <MiniMetric label="Online Nodes" value={String(overview?.cluster.online || 0)} />
            </div>
            <div className="space-y-3">
              {(overview?.cluster.nodes || []).slice(0, 4).map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950"
                >
                  <div>
                    <p className="font-medium">{node.id}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {node.ip || 'No IP exposed'}
                    </p>
                  </div>
                  <Badge variant="outline">{node.state}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(overview?.applications.items || []).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No application data available.
              </p>
            ) : (
              (overview?.applications.items || []).map((application) => (
                <div
                  key={application.name}
                  className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950"
                >
                  <div>
                    <p className="font-medium">{application.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {application.version || 'Version N/A'} |{' '}
                      {formatApplicationHealth(application.health)}
                    </p>
                  </div>
                  <Badge
                    className={
                      String(application.state).toUpperCase() === 'ACTIVE'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300'
                    }
                  >
                    {application.state}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No recent alerts.</p>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Badge
                      className={
                        alert.severity === 'critical'
                          ? 'bg-rose-600 text-white hover:bg-rose-600'
                          : alert.severity === 'warning'
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-500'
                            : 'bg-cyan-600 text-white hover:bg-cyan-600'
                      }
                    >
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(alert.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {alert.deviceId || 'Controller-wide'} | {alert.resolved ? 'Resolved' : 'Open'}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Controller Runtime
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MiniMetric
                label="Live Threads"
                value={formatIntegerValue(overview?.controller.system.threadsLive)}
              />
              <MiniMetric
                label="Daemon Threads"
                value={formatIntegerValue(overview?.controller.system.threadsDaemon)}
              />
              <MiniMetric
                label="Memory Used"
                value={formatMemoryValue(overview?.controller.system.usedMemoryMb)}
              />
              <MiniMetric
                label="Memory Total"
                value={formatMemoryValue(overview?.controller.system.totalMemoryMb)}
              />
              <MiniMetric
                label="Devices"
                value={formatIntegerValue(overview?.controller.system.devices)}
              />
              <MiniMetric
                label="Links"
                value={formatIntegerValue(overview?.controller.system.links)}
              />
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  JVM Pressure
                </p>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatPercentValue(overview?.controller.system.usedMemoryPercent)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, overview?.controller.system.usedMemoryPercent ?? 0))}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950">
                <span className="text-sm text-gray-500 dark:text-gray-400">Node</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {overview?.controller.system.node || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950">
                <span className="text-sm text-gray-500 dark:text-gray-400">Cluster ID</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {overview?.controller.system.clusterId || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950">
                <span className="text-sm text-gray-500 dark:text-gray-400">Hosts / Flows</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {overview?.controller.system.hosts ?? 0} /{' '}
                  {overview?.controller.system.flows ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              Mastership Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MiniMetric
                label="Sampled Devices"
                value={String(overview?.mastership.sampledDevices || 0)}
              />
              <MiniMetric
                label="Resolved Masters"
                value={String(overview?.mastership.resolvedDevices || 0)}
              />
            </div>

            <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Snapshot coverage: {overview?.mastership.sampledDevices || 0} devices sampled out of{' '}
              {overview?.mastership.totalDevices || 0} visible in ONOS.
            </div>

            <div className="space-y-3">
              {(overview?.mastership.leaders || []).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No mastership data returned by ONOS.
                </p>
              ) : (
                (overview?.mastership.leaders || []).map((leader) => (
                  <div
                    key={leader.controller}
                    className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950"
                  >
                    <div>
                      <p className="font-medium">{leader.controller}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {leader.devices} device(s) in the sampled snapshot
                      </p>
                    </div>
                    <Badge
                      className={
                        leader.online === true
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                          : leader.online === false
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300'
                            : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                      }
                    >
                      {leader.online === true
                        ? 'Online'
                        : leader.online === false
                          ? 'Offline'
                          : 'Unknown'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Top Link Hotspots
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topLoadedLinks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No link load telemetry returned by ONOS.
              </p>
            ) : (
              topLoadedLinks.map((entry, index) => {
                const relativeWidth =
                  hottestLinkValue > 0 && entry.utilization !== null
                    ? Math.max(8, Math.round(((entry.utilization ?? 0) / hottestLinkValue) * 100))
                    : 8;

                return (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{entry.device}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Port {entry.port}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatTelemetryScore(entry.utilization)}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                          Rank #{index + 1}
                        </p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all"
                        style={{ width: `${relativeWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}

            <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Link bars are ranked relative to the hottest link in the current ONOS snapshot.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
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
                  dataKey="value"
                >
                  {deviceTypeData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Controller Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              <MiniMetric label="Total" value={String(overview?.observability.totalMetrics || 0)} />
              <MiniMetric label="Timers" value={String(overview?.observability.timers || 0)} />
              <MiniMetric label="Counters" value={String(overview?.observability.counters || 0)} />
              <MiniMetric label="Gauges" value={String(overview?.observability.gauges || 0)} />
              <MiniMetric label="Meters" value={String(overview?.observability.meters || 0)} />
              <MiniMetric
                label="Histograms"
                value={String(overview?.observability.histograms || 0)}
              />
            </div>

            <div className="space-y-3">
              {metricHighlights.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No controller metrics returned by ONOS.
                </p>
              ) : (
                metricHighlights.map((entry) => (
                  <div
                    key={entry.name}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{entry.name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                          {entry.kind}
                        </p>
                      </div>
                      <Badge variant="outline">{entry.kind}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="rounded-xl bg-white px-3 py-2 dark:bg-slate-900">
                        Rate
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {formatMetricRate(entry.meanRate)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2 dark:bg-slate-900">
                        Counter
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {formatIntegerValue(entry.counter)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2 dark:bg-slate-900">
                        Max
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {formatMetricRate(entry.max)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AppWindow className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              Active VPLS Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MiniMetric label="Services" value={String(overview?.vpls.totalServices || 0)} />
              <MiniMetric label="Interfaces" value={String(overview?.vpls.totalInterfaces || 0)} />
            </div>

            <div className="flex flex-wrap gap-2">
              {(overview?.vpls.encapsulations || []).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No encapsulation summary available.
                </p>
              ) : (
                (overview?.vpls.encapsulations || []).map((item) => (
                  <Badge
                    key={item.name}
                    className="border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                  >
                    {item.name}: {item.count}
                  </Badge>
                ))
              )}
            </div>

            <div className="space-y-3">
              {vplsServices.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No VPLS services currently exposed by ONOS.
                </p>
              ) : (
                vplsServices.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {service.encapsulation || 'Encapsulation N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {service.interfaces}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">interfaces</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 xl:col-span-2">
          <CardHeader>
            <CardTitle>Device Traffic (RX/TX in MB)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
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

        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardHeader>
            <CardTitle>Intent Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {intentSummaryEntries.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No intent summary returned by ONOS.
              </p>
            ) : (
              intentSummaryEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950"
                >
                  <span className="text-sm capitalize">{key.replaceAll('_', ' ')}</span>
                  <span className="font-semibold">{String(value)}</span>
                </div>
              ))
            )}

            <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              This panel is ready for the next phase: IMR monitoring, reroute workflows, and
              intent-to-flow correlation.
            </div>
          </CardContent>
        </Card>
      </section>

      {/* NEW: Advanced Metrics Section */}
      <section className="mb-8 grid grid-cols-1 gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex gap-2 items-center">
            <Zap className="h-6 w-6 text-cyan-500" /> Advanced Metrics
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Cluster Health Card */}
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-500" />
                Cluster Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clusterHealth ? (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Nodes</p>
                      <p className="text-2xl font-bold">{clusterHealth.cluster.totalNodes}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
                      <p className="text-2xl font-bold text-emerald-500">
                        {clusterHealth.cluster.onlineNodes}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Offline</p>
                      <p className="text-2xl font-bold text-rose-500">
                        {clusterHealth.cluster.offlineNodes}
                      </p>
                    </div>
                  </div>
                  {clusterHealth.cluster.masterNode && (
                    <div className="rounded-lg bg-cyan-50 p-3 dark:bg-cyan-950/20">
                      <p className="text-xs uppercase text-cyan-600 dark:text-cyan-400">
                        Master Node
                      </p>
                      <p className="font-mono text-sm">{clusterHealth.cluster.masterNode}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">Loading...</p>
              )}
            </CardContent>
          </Card>

          {/* ONOS Applications Card */}
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AppWindow className="h-5 w-5 text-violet-500" />
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {applications ? (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                      <p className="text-2xl font-bold">{applications.summary.total}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                      <p className="text-2xl font-bold text-emerald-500">
                        {applications.summary.active}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p>
                      <p className="text-2xl font-bold text-amber-500">
                        {applications.summary.inactive}
                      </p>
                    </div>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {applications.applications.slice(0, 5).map((app) => (
                      <div key={app.id} className="flex items-center justify-between text-xs">
                        <span className="truncate">{app.name}</span>
                        <Badge
                          className={
                            app.state === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }
                        >
                          {app.state}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Loading...</p>
              )}
            </CardContent>
          </Card>

          {/* Intents Card */}
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-sky-500" />
                Intents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {intents ? (
                <>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                      <p className="text-xl font-bold">{intents.summary.total}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">√</p>
                      <p className="text-xl font-bold text-emerald-500">
                        {intents.summary.installed}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">✗</p>
                      <p className="text-xl font-bold text-rose-500">{intents.summary.failed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Other</p>
                      <p className="text-xl font-bold text-amber-500">{intents.summary.other}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Loading...</p>
              )}
            </CardContent>
          </Card>

          {/* Network Performance Card */}
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Network Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {performance ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Avg Utilization
                        </span>
                        <span className="font-bold">{performance.utilization.average}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                          className="bg-cyan-500 h-2 rounded-full"
                          style={{ width: `${performance.utilization.average}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">RX Throughput</p>
                        <p className="font-bold text-emerald-500">
                          {Math.round(performance.throughput.rxBytesPerSec / 1024 / 1024)} MB/s
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">TX Throughput</p>
                        <p className="font-bold text-sky-500">
                          {Math.round(performance.throughput.txBytesPerSec / 1024 / 1024)} MB/s
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Active Links: {performance.summary.linkCount}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Loading...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Traffic Heatmap Card - Full Width */}
        {heatmap && (
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Top 10 Traffic Links (Heatmap)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {heatmap.topLinks.length > 0 ? (
                  heatmap.topLinks.map((link, idx) => (
                    <div key={link.id} className="flex items-center gap-3">
                      <div className="w-8 text-center">
                        <span className="text-xs font-bold text-gray-500">#{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-mono">{link.link}</span>
                          <span className="text-xs text-gray-500">{link.utilization}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              link.utilization > 80
                                ? 'bg-rose-500'
                                : link.utilization > 50
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(link.utilization, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No traffic data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6">
        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardHeader>
            <CardTitle>Connected Devices</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                Loading dashboard data...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                        Device ID
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                        Live Ports
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                        RX (MB)
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                        TX (MB)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device) => (
                      <tr
                        key={device.device_id}
                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-cyan-600 dark:text-cyan-400">
                          {device.device_id}
                        </td>
                        <td className="px-4 py-3 capitalize">{device.type}</td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              device.available
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }
                          >
                            {device.available ? 'Online' : 'Offline'}
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
            )}
          </CardContent>
        </Card>
      </section>

      <DashboardChatbot stats={stats} overview={overview} linkLoadCount={linkLoad.length} />
    </AuthenticatedShell>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center justify-between">
          {icon}
          <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            {title}
          </span>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}

function formatMemoryValue(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }

  return `${value.toFixed(0)} MB`;
}

function formatIntegerValue(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }

  return String(Math.round(value));
}

function formatPercentValue(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }

  return `${value.toFixed(1)}%`;
}

function formatTelemetryScore(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }

  return value.toFixed(2);
}

function formatMetricRate(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }

  return value >= 100 ? value.toFixed(0) : value.toFixed(2);
}

function formatApplicationHealth(health: Record<string, unknown> | null) {
  if (!health) {
    return 'Health N/A';
  }

  const candidates = [health.status, health.state, health.health, health.message].filter(Boolean);

  return candidates.length > 0 ? String(candidates[0]) : 'Health available';
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(value));
}

function formatRelativeSync(lastSyncAt: number | null, clockNow: number) {
  if (!lastSyncAt) {
    return 'Syncing...';
  }

  const seconds = Math.max(0, Math.floor((clockNow - lastSyncAt) / 1000));

  if (seconds < 5) {
    return 'Just now';
  }

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
