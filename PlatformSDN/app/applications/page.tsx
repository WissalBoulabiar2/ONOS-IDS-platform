'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthenticatedShell } from '@/components/layout/authenticated-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { sdnApi, type ApplicationsResponse } from '@/services/api';
import {
  AppWindow,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Package,
  PowerOff,
  RefreshCw,
  Search,
  XCircle,
  Zap,
} from 'lucide-react';

function isActive(app: ApplicationsResponse['applications'][number]) {
  return String(app.state).toUpperCase() === 'ACTIVE';
}

export default function ApplicationsPage() {
  const [data, setData] = useState<ApplicationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const fetchApps = useCallback(async (background = false) => {
    background ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const response = await sdnApi.getApplications();
      setData(response);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load applications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchApps();
    const interval = setInterval(() => void fetchApps(true), 15_000);
    return () => clearInterval(interval);
  }, [fetchApps]);

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const toggleApp = async (app: ApplicationsResponse['applications'][number]) => {
    setToggling(app.id);
    setError(null);

    try {
      if (isActive(app)) {
        await sdnApi.deactivateApplication(app.id);
        showToast(`${app.name} deactivated`, true);
      } else {
        await sdnApi.activateApplication(app.id);
        showToast(`${app.name} activated`, true);
      }

      await fetchApps(true);
    } catch (toggleError) {
      showToast(toggleError instanceof Error ? toggleError.message : 'Action failed', false);
    } finally {
      setToggling(null);
    }
  };

  const visible = useMemo(() => {
    return (data?.applications ?? []).filter((app) => {
      if (filter === 'active' && !isActive(app)) {
        return false;
      }

      if (filter === 'inactive' && isActive(app)) {
        return false;
      }

      const query = search.trim().toLowerCase();
      if (!query) {
        return true;
      }

      return [
        app.name,
        app.id,
        app.description ?? '',
        app.category ?? '',
        app.origin ?? '',
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [data?.applications, filter, search]);

  const summary = data?.summary ?? { total: 0, active: 0, inactive: 0 };

  return (
    <AuthenticatedShell contentClassName="max-w-7xl">
      <section className="mb-8 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge className="border-violet-400/20 bg-violet-400/10 text-violet-200">
                ONOS Applications
              </Badge>
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                {summary.active} active
              </Badge>
              {summary.inactive > 0 && (
                <Badge className="border-amber-400/20 bg-amber-400/10 text-amber-200">
                  {summary.inactive} inactive
                </Badge>
              )}
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
              <AppWindow className="h-8 w-8 text-violet-300" />
              Applications
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              Manage ONOS applications, inspect dependencies and prepare the platform for
              controller-side services.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{summary.total}</p>
                <p className="text-xs text-slate-400">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{summary.active}</p>
                <p className="text-xs text-slate-400">Active</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">{summary.inactive}</p>
                <p className="text-xs text-slate-400">Inactive</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {toast && (
        <div
          className={`mb-4 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
            toast.ok
              ? 'border-emerald-800 bg-emerald-950/60 text-emerald-300'
              : 'border-red-800 bg-red-950/60 text-red-300'
          }`}
        >
          {toast.ok ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 flex-shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search apps..."
            className="border-slate-700 bg-slate-900 pl-9 text-slate-200 placeholder:text-slate-600 focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'active', 'inactive'] as const).map((item) => (
            <Button
              key={item}
              size="sm"
              variant={filter === item ? 'default' : 'outline'}
              onClick={() => setFilter(item)}
              className={
                filter === item
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => void fetchApps(true)}
            disabled={refreshing}
            className="border-slate-700 text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-px p-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-lg bg-slate-800/50" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="mb-3 h-10 w-10 text-slate-600" />
              <p className="text-sm text-slate-400">No applications match your filter</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Application
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Version
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Origin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((app) => {
                  const active = isActive(app);
                  const isExpanded = expanded === app.id;

                  return (
                    <React.Fragment key={app.id}>
                      <tr
                        className={`border-b border-slate-800/60 transition-colors hover:bg-slate-800/30 ${
                          isExpanded ? 'bg-slate-800/20' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="flex items-center gap-2 text-left"
                            onClick={() => setExpanded(isExpanded ? null : app.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                            )}
                            <div>
                              <p className="font-medium text-slate-100">{app.name}</p>
                              <p className="text-[11px] text-slate-500">{app.id}</p>
                            </div>
                          </button>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">
                          {app.version ?? 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{app.origin ?? '—'}</td>
                        <td className="px-4 py-3">
                          {active ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                              Installed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={toggling === app.id}
                            onClick={() => void toggleApp(app)}
                            className={
                              active
                                ? 'border-rose-700 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300'
                                : 'border-emerald-700 text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
                            }
                          >
                            {toggling === app.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : active ? (
                              <>
                                <PowerOff className="mr-1.5 h-3.5 w-3.5" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Zap className="mr-1.5 h-3.5 w-3.5" />
                                Activate
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="border-b border-slate-800/60 bg-slate-800/10">
                          <td colSpan={5} className="px-8 py-4">
                            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                              <div>
                                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Description
                                </p>
                                <p className="text-slate-300">
                                  {app.description ?? 'No description available.'}
                                </p>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Features
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {(app.features ?? []).length > 0 ? (
                                    app.features!.map((feature) => (
                                      <span
                                        key={feature}
                                        className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400"
                                      >
                                        {feature}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-slate-600">—</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Required apps
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {(app.requiredApps ?? []).length > 0 ? (
                                    app.requiredApps!.map((dependency) => (
                                      <span
                                        key={dependency}
                                        className="rounded border border-violet-800/50 bg-violet-950/30 px-2 py-0.5 text-[11px] text-violet-400"
                                      >
                                        {dependency}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-slate-600">None</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {!loading && visible.length > 0 && (
        <p className="mt-3 text-right text-xs text-slate-600">
          Showing {visible.length} of {data?.applications.length ?? 0} applications
        </p>
      )}
    </AuthenticatedShell>
  );
}
