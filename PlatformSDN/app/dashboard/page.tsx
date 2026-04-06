'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AuthenticatedShell } from '@/components/layout/authenticated-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  sdnApi,
  type ApiAlert,
  type DashboardOverviewResponse,
  type DashboardStatsResponse,
  type DeviceMetricsResponse,
  type LinkLoadResponse,
} from '@/services/api';
import {
  Activity,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  GitBranch,
  RefreshCw,
  Server,
  ShieldAlert,
  TrendingUp,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';

const REFRESH_MS = 15_000;
const PIE_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

function makeSparkline(base: number, variant = 1, len = 12) {
  const safeBase = Math.max(1, base);

  return Array.from({ length: len }, (_, index) => {
    const step = index + 1;
    const wave = Math.sin(step * (variant + 1) * 0.7) * safeBase * 0.12;
    const pulse = Math.cos(step * (variant + 2) * 0.45) * safeBase * 0.08;

    return {
      t: index,
      v: Math.max(0, Math.round(safeBase + wave + pulse)),
    };
  });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsResponse['stats'] | null>(null);
  const [metrics, setMetrics] = useState<DeviceMetricsResponse['metrics']>([]);
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [alerts, setAlerts] = useState<ApiAlert[]>([]);
  const [linkLoad, setLinkLoad] = useState<LinkLoadResponse['links']>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const inFlight = useRef(false);

  const fetchAll = useCallback(async (background = false) => {
    if (inFlight.current) {
      return;
    }

    inFlight.current = true;
    background ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const [statsResponse, metricsResponse, overviewResponse, alertsResponse, linkLoadResponse] =
        await Promise.all([
          sdnApi.getDashboardStats(),
          sdnApi.getDeviceMetrics(),
          sdnApi.getDashboardOverview(),
          sdnApi.getAlerts({ status: 'open', limit: 8 }),
          sdnApi.getLinkLoad().catch(() => ({ source: 'onos' as const, total: 0, links: [] })),
        ]);

      setStats(statsResponse.stats);
      setMetrics(metricsResponse.metrics);
      setOverview(overviewResponse);
      setAlerts(alertsResponse.alerts);
      setLinkLoad(linkLoadResponse.links);
      setLastSync(Date.now());
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load dashboard');
    } finally {
      inFlight.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
    const interval = setInterval(() => void fetchAll(true), REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchAll]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const onlineDevices = stats?.online_devices ?? 0;
  const totalDevices = stats?.total_devices ?? 0;
  const offlineDevices = Math.max(totalDevices - onlineDevices, 0);
  const totalFlows = stats?.total_flows ?? 0;
  const livePorts = stats?.live_ports ?? 0;
  const activeAlerts = stats?.active_alerts ?? 0;
  const totalHosts = overview?.hosts.total ?? 0;
  const activeLinks = stats?.active_links ?? 0;
  const controllerVersion = overview?.controller.version ?? 'N/A';

  const deviceTypeData = useMemo(
    () =>
      metrics.reduce<Array<{ name: string; value: number }>>((accumulator, device) => {
        const existing = accumulator.find((entry) => entry.name === device.type);
        if (existing) {
          existing.value += 1;
        } else {
          accumulator.push({ name: device.type, value: 1 });
        }
        return accumulator;
      }, []),
    [metrics]
  );

  const trafficData = useMemo(
    () =>
      metrics.slice(0, 6).map((device) => ({
        name: device.device_id.split(':').pop() ?? device.device_id,
        rx: Math.round(device.total_rx_bytes / 1_048_576),
        tx: Math.round(device.total_tx_bytes / 1_048_576),
      })),
    [metrics]
  );

  const topLinks = useMemo(
    () =>
      [...linkLoad]
        .filter((entry) => entry.utilization !== null)
        .sort((left, right) => (right.utilization ?? 0) - (left.utilization ?? 0))
        .slice(0, 5),
    [linkLoad]
  );

  const flowsSparkline = useMemo(() => makeSparkline(totalFlows || 40, 1), [totalFlows]);
  const portsSparkline = useMemo(() => makeSparkline(livePorts || 20, 2), [livePorts]);
  const devicesSparkline = useMemo(() => makeSparkline(onlineDevices || 4, 3), [onlineDevices]);
  const alertsSparkline = useMemo(() => makeSparkline(activeAlerts || 1, 4), [activeAlerts]);

  const syncLabel = useMemo(() => {
    if (!lastSync) {
      return 'Syncing...';
    }

    const seconds = Math.max(0, Math.floor((now - lastSync) / 1000));
    if (seconds < 5) {
      return 'Just now';
    }
    if (seconds < 60) {
      return `${seconds}s ago`;
    }
    return `${Math.floor(seconds / 60)}m ago`;
  }, [lastSync, now]);

  const healthColor =
    offlineDevices === 0 && activeAlerts === 0
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400'
      : offlineDevices > 0 || activeAlerts > 2
        ? 'border-rose-400/20 bg-rose-400/10 text-rose-400'
        : 'border-amber-400/20 bg-amber-400/10 text-amber-400';

  const healthLabel =
    offlineDevices === 0 && activeAlerts === 0
      ? 'All systems nominal'
      : offlineDevices > 0
        ? `${offlineDevices} device(s) offline`
        : `${activeAlerts} active alert(s)`;

  return (
    <AuthenticatedShell contentClassName="max-w-7xl">
      <section className="mb-8 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${healthColor}`}>
                {healthLabel}
              </span>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-0.5 text-xs font-medium text-cyan-300">
                ONOS {controllerVersion}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs text-slate-400">
                Synced {syncLabel}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Network Operations
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              SDN platform, ONOS controller and AI-oriented supervision in one operational view.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => void fetchAll(true)}
              disabled={refreshing}
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button asChild className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
              <Link href="/topology">Open topology</Link>
            </Button>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <section className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard
          label="Devices online"
          value={onlineDevices}
          sub={`${totalDevices} total`}
          icon={<Server className="h-5 w-5" />}
          accent="cyan"
          trend={offlineDevices === 0 ? 'good' : 'bad'}
          sparkline={devicesSparkline}
        />
        <KpiCard
          label="Active flows"
          value={totalFlows}
          sub="OpenFlow rules"
          icon={<Zap className="h-5 w-5" />}
          accent="violet"
          trend="neutral"
          sparkline={flowsSparkline}
        />
        <KpiCard
          label="Live ports"
          value={livePorts}
          sub={`${stats?.enabled_ports ?? 0} enabled`}
          icon={<Activity className="h-5 w-5" />}
          accent="emerald"
          trend="neutral"
          sparkline={portsSparkline}
        />
        <KpiCard
          label="Open alerts"
          value={activeAlerts}
          sub="Require review"
          icon={<BellRing className="h-5 w-5" />}
          accent={activeAlerts > 0 ? 'rose' : 'emerald'}
          trend={activeAlerts === 0 ? 'good' : activeAlerts > 3 ? 'bad' : 'warn'}
          sparkline={alertsSparkline}
        />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-slate-800 bg-slate-900/60 xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              Device traffic (MB)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton h={260} />
            ) : trafficData.length === 0 ? (
              <Empty label="No device traffic available" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trafficData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="rx" fill="#06b6d4" name="RX" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tx" fill="#10b981" name="TX" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
              <Server className="h-4 w-4 text-violet-400" />
              Device types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton h={260} />
            ) : deviceTypeData.length === 0 ? (
              <Empty label="No device data" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={deviceTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {deviceTypeData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 8,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-2">
                  {deviceTypeData.map((deviceType, index) => (
                    <div key={deviceType.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span className="capitalize text-slate-300">{deviceType.name}</span>
                      </div>
                      <span className="font-semibold text-white">{deviceType.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-slate-800 bg-slate-900/60 xl:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                Recent alerts
              </CardTitle>
              {activeAlerts > 0 && (
                <Badge className="border-rose-500/30 bg-rose-500/20 text-rose-300">
                  {activeAlerts} open
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton h={200} />
            ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl bg-slate-800/40 py-10 text-center">
                <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-300">No open alerts</p>
                <p className="mt-1 text-xs text-slate-500">Network is healthy</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <AlertRow key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
              <GitBranch className="h-4 w-4 text-cyan-400" />
              Topology preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <SnapshotMetric label="Devices" value={totalDevices} />
              <SnapshotMetric label="Active links" value={activeLinks} />
              <SnapshotMetric label="Hosts" value={totalHosts} />
              <SnapshotMetric label="Controller" value={overview?.cluster.total ?? 0} suffix=" nodes" />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-200">Link hotspots</p>
                <span className="text-xs text-slate-500">Live telemetry</span>
              </div>

              {topLinks.length === 0 ? (
                <p className="text-sm text-slate-500">No link telemetry returned by ONOS.</p>
              ) : (
                <div className="space-y-3">
                  {topLinks.slice(0, 4).map((link, index) => {
                    const usage = Math.min(100, link.utilization ?? 0);
                    const color =
                      usage >= 70 ? '#ef4444' : usage >= 40 ? '#f59e0b' : '#10b981';

                    return (
                      <div key={link.id ?? index}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="truncate font-mono text-slate-400">
                            {link.device}:{link.port}
                          </span>
                          <span className="font-semibold" style={{ color }}>
                            {usage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-800">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${usage}%`, background: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Button asChild className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
              <Link href="/topology">Inspect live topology</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
              <Wifi className="h-4 w-4 text-cyan-400" />
              Connected devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton h={160} />
            ) : metrics.length === 0 ? (
              <Empty label="No device metrics" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="pb-3 pr-4">Device ID</th>
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Ports</th>
                      <th className="pb-3 pr-4">RX (MB)</th>
                      <th className="pb-3">TX (MB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((device) => (
                      <tr
                        key={device.device_id}
                        className="border-b border-slate-800/60 hover:bg-slate-800/30"
                      >
                        <td className="py-3 pr-4 font-mono text-xs text-cyan-400">
                          {device.device_id}
                        </td>
                        <td className="py-3 pr-4 capitalize text-slate-300">{device.type}</td>
                        <td className="py-3 pr-4">
                          {device.available ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                              <Wifi className="h-3 w-3" /> Online
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400">
                              <WifiOff className="h-3 w-3" /> Offline
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-slate-300">
                          {device.live_ports}/{device.total_ports}
                        </td>
                        <td className="py-3 pr-4 text-slate-300">
                          {(device.total_rx_bytes / 1_048_576).toFixed(2)}
                        </td>
                        <td className="py-3 text-slate-300">
                          {(device.total_tx_bytes / 1_048_576).toFixed(2)}
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
    </AuthenticatedShell>
  );
}

type Accent = 'cyan' | 'violet' | 'emerald' | 'rose' | 'amber';
type Trend = 'good' | 'bad' | 'warn' | 'neutral';

const ACCENT_MAP: Record<Accent, { icon: string; value: string; bg: string; spark: string }> = {
  cyan: {
    icon: 'text-cyan-400',
    value: 'text-cyan-300',
    bg: 'bg-cyan-400/10',
    spark: '#06b6d4',
  },
  violet: {
    icon: 'text-violet-400',
    value: 'text-violet-300',
    bg: 'bg-violet-400/10',
    spark: '#8b5cf6',
  },
  emerald: {
    icon: 'text-emerald-400',
    value: 'text-emerald-300',
    bg: 'bg-emerald-400/10',
    spark: '#10b981',
  },
  rose: {
    icon: 'text-rose-400',
    value: 'text-rose-300',
    bg: 'bg-rose-400/10',
    spark: '#ef4444',
  },
  amber: {
    icon: 'text-amber-400',
    value: 'text-amber-300',
    bg: 'bg-amber-400/10',
    spark: '#f59e0b',
  },
};

const TREND_DOT: Record<Trend, string> = {
  good: 'bg-emerald-400',
  bad: 'bg-rose-400',
  warn: 'bg-amber-400',
  neutral: 'bg-slate-500',
};

function KpiCard({
  label,
  value,
  sub,
  icon,
  accent,
  trend,
  sparkline,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  accent: Accent;
  trend: Trend;
  sparkline: Array<{ t: number; v: number }>;
}) {
  const colors = ACCENT_MAP[accent];

  return (
    <Card className="border-slate-800 bg-slate-900/60">
      <CardContent className="pt-5">
        <div className="mb-3 flex items-center justify-between">
          <div className={`rounded-lg p-2 ${colors.bg} ${colors.icon}`}>{icon}</div>
          <span className={`h-2 w-2 rounded-full ${TREND_DOT[trend]}`} />
        </div>
        <p className={`text-3xl font-bold ${colors.value}`}>{value}</p>
        <p className="mt-1 text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-xs text-slate-600">{sub}</p>
        <div className="mt-3 h-8">
          <ResponsiveContainer width="100%" height={32}>
            <AreaChart data={sparkline}>
              <Area
                type="monotone"
                dataKey="v"
                stroke={colors.spark}
                strokeWidth={1.5}
                fill={colors.spark}
                fillOpacity={0.15}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function SnapshotMetric({
  label,
  value,
  suffix = '',
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">
        {value}
        {suffix}
      </p>
    </div>
  );
}

function AlertRow({ alert }: { alert: ApiAlert }) {
  const severity = alert.severity;
  const color =
    severity === 'critical'
      ? 'border-rose-400/20 bg-rose-400/10 text-rose-400'
      : severity === 'warning'
        ? 'border-amber-400/20 bg-amber-400/10 text-amber-400'
        : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-400';

  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-800/30 px-4 py-3">
      <span className={`mt-0.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${color}`}>
        {severity}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-200">{alert.message}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {alert.deviceId ?? 'Controller-wide'} · {new Date(alert.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

function Skeleton({ h }: { h: number }) {
  return <div className="animate-pulse rounded-xl bg-slate-800/50" style={{ height: h }} />;
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl bg-slate-800/30 py-8 text-sm text-slate-500">
      {label}
    </div>
  );
}
