'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthenticatedShell } from '@/components/layout/authenticated-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  sdnApi,
  type DeviceMetricsResponse,
  type LinkLoadResponse,
  type NetworkPerformanceResponse,
} from '@/services/api';
import { Activity, Gauge, RefreshCw, Server, TrendingUp } from 'lucide-react';

export default function MetricsPage() {
  const [performance, setPerformance] = useState<NetworkPerformanceResponse | null>(null);
  const [devices, setDevices] = useState<DeviceMetricsResponse['metrics']>([]);
  const [links, setLinks] = useState<LinkLoadResponse['links']>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (background = false) => {
    background ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const [performanceResponse, deviceMetrics, linkLoad] = await Promise.all([
        sdnApi.getNetworkPerformance(),
        sdnApi.getDeviceMetrics(),
        sdnApi.getLinkLoad().catch(() => ({ source: 'onos' as const, total: 0, links: [] })),
      ]);

      setPerformance(performanceResponse);
      setDevices(deviceMetrics.metrics);
      setLinks(linkLoad.links);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchMetrics();
    const interval = setInterval(() => void fetchMetrics(true), 15_000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const topDevices = useMemo(
    () =>
      [...devices]
        .sort(
          (left, right) =>
            right.total_rx_bytes + right.total_tx_bytes - (left.total_rx_bytes + left.total_tx_bytes)
        )
        .slice(0, 5),
    [devices]
  );

  const topLinks = useMemo(
    () =>
      [...links]
        .filter((link) => link.utilization !== null)
        .sort((left, right) => (right.utilization ?? 0) - (left.utilization ?? 0))
        .slice(0, 6),
    [links]
  );

  return (
    <AuthenticatedShell contentClassName="max-w-7xl">
      <section className="mb-8 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge className="border-sky-400/20 bg-sky-400/10 text-sky-200">Metrics Center</Badge>
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                ONOS live telemetry
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Network Metrics</h1>
            <p className="mt-1 text-sm text-slate-400">
              A focused page for throughput, utilization and high-load devices.
            </p>
          </div>
          <Button
            onClick={() => void fetchMetrics(true)}
            disabled={refreshing}
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </section>

      {error && (
        <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          icon={<TrendingUp className="h-5 w-5 text-cyan-400" />}
          title="RX throughput"
          value={`${Math.round((performance?.throughput.rxBytesPerSec ?? 0) / 1024 / 1024)} MB/s`}
          loading={loading}
        />
        <MetricCard
          icon={<Activity className="h-5 w-5 text-emerald-400" />}
          title="TX throughput"
          value={`${Math.round((performance?.throughput.txBytesPerSec ?? 0) / 1024 / 1024)} MB/s`}
          loading={loading}
        />
        <MetricCard
          icon={<Gauge className="h-5 w-5 text-amber-400" />}
          title="Average utilization"
          value={`${performance?.utilization.average ?? 0}%`}
          loading={loading}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-white">Top devices by traffic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="h-48 animate-pulse rounded-xl bg-slate-800/50" />
            ) : topDevices.length === 0 ? (
              <p className="text-sm text-slate-500">No device telemetry available.</p>
            ) : (
              topDevices.map((device) => (
                <div
                  key={device.device_id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <div>
                    <p className="font-mono text-sm text-cyan-300">{device.device_id}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      RX {(device.total_rx_bytes / 1_048_576).toFixed(2)} MB · TX{' '}
                      {(device.total_tx_bytes / 1_048_576).toFixed(2)} MB
                    </p>
                  </div>
                  <Server className="h-4 w-4 text-slate-500" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-white">Top link hotspots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="h-48 animate-pulse rounded-xl bg-slate-800/50" />
            ) : topLinks.length === 0 ? (
              <p className="text-sm text-slate-500">No link utilization available.</p>
            ) : (
              topLinks.map((link) => {
                const usage = Math.min(100, link.utilization ?? 0);
                const color =
                  usage >= 70 ? '#ef4444' : usage >= 40 ? '#f59e0b' : '#10b981';

                return (
                  <div key={link.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-mono text-slate-300">
                        {link.device}:{link.port}
                      </span>
                      <span className="font-semibold" style={{ color }}>
                        {usage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${usage}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>
    </AuthenticatedShell>
  );
}

function MetricCard({
  icon,
  title,
  value,
  loading,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  loading: boolean;
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/60">
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center justify-between">
          {icon}
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</span>
        </div>
        <p className="text-3xl font-bold text-white">{loading ? '...' : value}</p>
      </CardContent>
    </Card>
  );
}
