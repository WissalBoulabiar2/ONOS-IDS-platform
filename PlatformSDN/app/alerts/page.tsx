'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthenticatedShell } from '@/components/layout/authenticated-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sdnApi, type ApiAlert } from '@/services/api';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock3,
  Filter,
  Radar,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Siren,
} from 'lucide-react';

type ResolutionFilter = 'all' | 'open' | 'resolved';
type SeverityFilter = 'all' | 'critical' | 'warning' | 'info';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<ApiAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolutionFilter, setResolutionFilter] = useState<ResolutionFilter>('open');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [source, setSource] = useState<'database' | 'onos' | 'local-store'>('onos');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    critical: 0,
    warning: 0,
    info: 0,
  });

  const fetchAlerts = useCallback(
    async (background = false) => {
      try {
        if (background) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const data = await sdnApi.getAlerts({
          status: resolutionFilter,
          severity: severityFilter,
          limit: 200,
        });

        setAlerts(data.alerts);
        setSummary(data.summary);
        setSource(data.source);
        setLastSync(new Date().toLocaleTimeString());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [resolutionFilter, severityFilter]
  );

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => {
      fetchAlerts(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const latestIncident = useMemo(() => alerts[0] ?? null, [alerts]);

  const handleResolveAlert = async (alertId: string) => {
    try {
      setResolvingAlertId(alertId);
      setError(null);
      await sdnApi.resolveAlert(alertId);
      await fetchAlerts(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert');
    } finally {
      setResolvingAlertId(null);
    }
  };

  return (
    <AuthenticatedShell contentClassName="max-w-7xl">
      <section className="mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-950 via-rose-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge className="border-rose-400/20 bg-rose-400/10 text-rose-100">
                Incident Monitoring
              </Badge>
              <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                {source === 'database'
                  ? 'PostgreSQL-backed alerts'
                  : source === 'local-store'
                    ? 'Local persisted alerts'
                    : 'Live ONOS-derived alerts'}
              </Badge>
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Network Alerts Center
            </h1>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
              Real incidents are now generated from ONOS state and synchronized to PostgreSQL when
              the database is available.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:min-w-[320px]">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-rose-100">Latest refresh</p>
            <p className="text-2xl font-semibold">{lastSync || 'Syncing...'}</p>
            <p className="mt-2 text-sm text-slate-300">
              The backend checks controller reachability, devices, links, ports, and pending flows
              every refresh cycle.
            </p>
            <Button
              onClick={() => fetchAlerts(true)}
              variant="outline"
              className="mt-4 w-full border-white/20 bg-transparent text-white hover:bg-white/10"
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh alerts
            </Button>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-200">Alert backend error</h3>
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center justify-between">
              <BellRing className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Open
              </span>
            </div>
            <p className="text-3xl font-bold">{summary.open}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Active incidents requiring review
            </p>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/80 shadow-sm dark:border-rose-900/70 dark:bg-rose-950/30">
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center justify-between">
              <Siren className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <span className="text-xs uppercase tracking-[0.2em] text-rose-500 dark:text-rose-300">
                Critical
              </span>
            </div>
            <p className="text-3xl font-bold">{summary.critical}</p>
            <p className="mt-1 text-sm text-rose-700 dark:text-rose-200">
              Major disruptions in controller or fabric state
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/80 shadow-sm dark:border-amber-900/70 dark:bg-amber-950/30">
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs uppercase tracking-[0.2em] text-amber-500 dark:text-amber-300">
                Warning
              </span>
            </div>
            <p className="text-3xl font-bold">{summary.warning}</p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">
              Degraded ports or pending flow activity
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/80 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/30">
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center justify-between">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-300">
                Resolved
              </span>
            </div>
            <p className="text-3xl font-bold">{summary.resolved}</p>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">
              Historical incidents already closed
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-xl">Alert Feed</CardTitle>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Filter incidents by state and severity, then resolve acknowledged items from the
                    database-backed timeline.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'open', 'resolved'] as const).map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={resolutionFilter === value ? 'default' : 'outline'}
                      onClick={() => setResolutionFilter(value)}
                      className={
                        resolutionFilter === value
                          ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                      }
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      {value === 'all' ? 'All' : value === 'open' ? 'Open' : 'Resolved'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-5 flex flex-wrap gap-2">
                {(['all', 'critical', 'warning', 'info'] as const).map((value) => (
                  <Button
                    key={value}
                    size="sm"
                    variant="outline"
                    onClick={() => setSeverityFilter(value)}
                    className={
                      severityFilter === value
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                    }
                  >
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </Button>
                ))}
              </div>

              {loading ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-950">
                  <p className="text-gray-500 dark:text-gray-400">Loading alerts...</p>
                </div>
              ) : alerts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
                  <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
                  <p className="text-lg font-semibold">No alerts for the current filter</p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    The network looks healthy for this filter set.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => {
                    const severityStyles = {
                      critical:
                        'border-rose-200 bg-rose-50 dark:border-rose-900/70 dark:bg-rose-950/20',
                      warning:
                        'border-amber-200 bg-amber-50 dark:border-amber-900/70 dark:bg-amber-950/20',
                      info: 'border-cyan-200 bg-cyan-50 dark:border-cyan-900/70 dark:bg-cyan-950/20',
                    };

                    return (
                      <div
                        key={alert.id}
                        className={`rounded-3xl border p-5 transition-colors ${severityStyles[alert.severity]}`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                className={
                                  alert.severity === 'critical'
                                    ? 'bg-rose-600 text-white hover:bg-rose-600'
                                    : alert.severity === 'warning'
                                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-500'
                                      : 'bg-cyan-600 text-white hover:bg-cyan-600'
                                }
                              >
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {alert.type.replaceAll('_', ' ')}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={
                                  alert.resolved
                                    ? 'text-emerald-600 dark:text-emerald-300'
                                    : 'text-rose-600 dark:text-rose-300'
                                }
                              >
                                {alert.resolved ? 'Resolved' : 'Open'}
                              </Badge>
                            </div>

                            <div>
                              <p className="text-base font-semibold">{alert.message}</p>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Alert source{' '}
                                {alert.deviceId
                                  ? `for device ${alert.deviceId}`
                                  : 'from controller-wide monitoring'}
                                .
                              </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                              <div className="rounded-2xl bg-white/60 p-3 dark:bg-gray-950/60">
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                                  Created
                                </p>
                                <p className="mt-2 font-medium">
                                  {formatAlertTimestamp(alert.createdAt)}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-white/60 p-3 dark:bg-gray-950/60">
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                                  Device
                                </p>
                                <p className="mt-2 font-mono text-xs sm:text-sm">
                                  {alert.deviceId ?? 'Controller-wide'}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-white/60 p-3 dark:bg-gray-950/60">
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                                  Resolved
                                </p>
                                <p className="mt-2 font-medium">
                                  {alert.resolvedAt
                                    ? formatAlertTimestamp(alert.resolvedAt)
                                    : 'Pending'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {!alert.resolved &&
                          (source === 'database' || source === 'local-store') ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="self-start border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                              onClick={() => handleResolveAlert(alert.id)}
                              disabled={resolvingAlertId === alert.id}
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              {resolvingAlertId === alert.id ? 'Resolving...' : 'Resolve'}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-xl">Incident Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestIncident ? (
                <>
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                      Latest event
                    </p>
                    <p className="mt-2 text-sm font-semibold">{latestIncident.message}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                        Severity
                      </p>
                      <p className="mt-2 text-sm font-semibold capitalize">
                        {latestIncident.severity}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                        Type
                      </p>
                      <p className="mt-2 text-sm font-semibold capitalize">
                        {latestIncident.type.replaceAll('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The alert feed is now backed by controller state, link status, port health, and
                    pending flow detection.
                  </p>
                </>
              ) : (
                <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                  No incident is available for the current filter.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-xl">Detection Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-4 w-4 text-rose-500" />
                <p>
                  Controller unreachable, device loss, and inactive links are raised as critical
                  incidents.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 text-amber-500" />
                <p>
                  Enabled-but-not-live ports and pending flow rules raise warning or critical alerts
                  depending on impact.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Radar className="mt-0.5 h-4 w-4 text-cyan-500" />
                <p>
                  Resolved alerts remain visible in PostgreSQL to keep a useful operational history.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-xl">Current Mix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950">
                <span>Critical</span>
                <span className="font-semibold">{summary.critical}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950">
                <span>Warning</span>
                <span className="font-semibold">{summary.warning}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950">
                <span>Info</span>
                <span className="font-semibold">{summary.info}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950">
                <span>Total history</span>
                <span className="font-semibold">{summary.total}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AuthenticatedShell>
  );
}

function formatAlertTimestamp(value: string | Date) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(value));
}
