'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthenticatedShell } from '@/components/layout/authenticated-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { sdnApi, type ApiFlow } from '@/services/api';
import {
  Activity,
  AlertCircle,
  Copy,
  Filter,
  Network,
  Plus,
  PlayCircle,
  RefreshCw,
  Shield,
  Trash2,
  Zap,
} from 'lucide-react';

function summarizeCriterion(criterion: Record<string, unknown>) {
  const type = String(criterion.type || 'UNKNOWN');

  switch (type) {
    case 'IN_PORT':
      return `in_port:${criterion.port}`;
    case 'ETH_TYPE':
      return `eth_type:${criterion.ethType}`;
    case 'IPV4_SRC':
      return `ipv4_src:${criterion.ip}`;
    case 'IPV4_DST':
      return `ipv4_dst:${criterion.ip}`;
    case 'TCP_DST':
      return `tcp_dst:${criterion.tcpPort}`;
    case 'TCP_SRC':
      return `tcp_src:${criterion.tcpPort}`;
    default:
      return type.toLowerCase();
  }
}

function summarizeInstruction(instruction: Record<string, unknown>) {
  const type = String(instruction.type || 'UNKNOWN');

  switch (type) {
    case 'OUTPUT':
      return `output:${instruction.port}`;
    case 'DROP':
      return 'drop';
    default:
      return type.toLowerCase();
  }
}

function buildFlowPayload(params: {
  deviceId: string;
  priority: string;
  inPort: string;
  outputPort: string;
  ethType: string;
  isPermanent: boolean;
  timeout: string;
}) {
  const criteria: Array<Record<string, unknown>> = [];

  if (params.inPort.trim()) {
    criteria.push({
      type: 'IN_PORT',
      port: Number(params.inPort),
    });
  }

  if (params.ethType.trim()) {
    criteria.push({
      type: 'ETH_TYPE',
      ethType: params.ethType,
    });
  }

  return {
    priority: Number(params.priority || 40000),
    timeout: params.isPermanent ? 0 : Number(params.timeout || 0),
    isPermanent: params.isPermanent,
    deviceId: params.deviceId,
    treatment: {
      instructions: [
        {
          type: 'OUTPUT',
          port: params.outputPort || 'CONTROLLER',
        },
      ],
    },
    selector: {
      criteria,
    },
  };
}

export default function FlowsPage() {
  const [flows, setFlows] = useState<ApiFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingFlowId, setDeletingFlowId] = useState<string | null>(null);
  const [source, setSource] = useState<'database' | 'onos'>('onos');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [deviceId, setDeviceId] = useState('of:0000000000000001');
  const [appId, setAppId] = useState('org.platformsdn.app');
  const [priority, setPriority] = useState('40000');
  const [inPort, setInPort] = useState('1');
  const [outputPort, setOutputPort] = useState('2');
  const [ethType, setEthType] = useState('0x0800');
  const [isPermanent, setIsPermanent] = useState(true);
  const [timeout, setTimeout] = useState('0');

  const fetchFlows = useCallback(async (background = false) => {
    try {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await sdnApi.getFlows();
      setFlows(data.flows);
      setSource((data.source || 'onos') as 'database' | 'onos');
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flows');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFlows();
    const interval = setInterval(() => {
      fetchFlows(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchFlows]);

  const handleCreateFlow = async () => {
    try {
      setCreating(true);
      setError(null);
      setMessage(null);

      const payload = buildFlowPayload({
        deviceId,
        priority,
        inPort,
        outputPort,
        ethType,
        isPermanent,
        timeout,
      });

      await sdnApi.createFlow(deviceId, payload, appId);
      setMessage('Flow created successfully on ONOS.');
      await fetchFlows(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flow');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteFlow = async (flow: ApiFlow) => {
    try {
      setDeletingFlowId(flow.flowId);
      setError(null);
      setMessage(null);
      await sdnApi.deleteFlow(flow.deviceId, flow.flowId);
      setMessage(`Flow ${flow.flowId} deleted successfully.`);
      await fetchFlows(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete flow');
    } finally {
      setDeletingFlowId(null);
    }
  };

  const normalizedFlows = useMemo(
    () =>
      flows.map((flow) => {
        const criteria = Array.isArray(flow.selector?.criteria)
          ? flow.selector?.criteria || []
          : [];
        const instructions = Array.isArray(flow.treatment?.instructions)
          ? flow.treatment?.instructions || []
          : [];

        return {
          ...flow,
          matchSummary: criteria.length > 0 ? criteria.map(summarizeCriterion).join(' | ') : 'any',
          actionSummary:
            instructions.length > 0 ? instructions.map(summarizeInstruction).join(' | ') : 'none',
        };
      }),
    [flows]
  );

  const addedFlows = normalizedFlows.filter((flow) =>
    String(flow.state).toLowerCase().includes('added')
  );
  const pendingFlows = normalizedFlows.filter((flow) =>
    String(flow.state).toLowerCase().includes('pending')
  );
  const dropRules = normalizedFlows.filter((flow) => flow.actionSummary.includes('drop')).length;

  return (
    <AuthenticatedShell contentClassName="max-w-7xl">
      <section className="mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                OpenFlow Policy
              </Badge>
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                {source === 'database' ? 'PostgreSQL cache' : 'Live ONOS'}
              </Badge>
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Flow Rules Console
            </h1>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
              Flow listing and creation now use the secured backend and ONOS directly. You can
              refresh, create, and delete real flow entries from this page.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:min-w-[300px]">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-cyan-200">Policy status</p>
            <p className="text-2xl font-semibold">
              {pendingFlows.length > 0
                ? `${pendingFlows.length} pending update(s)`
                : 'Rules synchronized'}
            </p>
            <p className="mt-2 text-sm text-slate-300">Last sync: {lastSync || 'Syncing...'}</p>
            <Button
              onClick={() => fetchFlows(true)}
              variant="outline"
              className="mt-4 w-full border-white/20 bg-transparent text-white hover:bg-white/10"
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh flows
            </Button>
          </div>
        </div>
      </section>

      {(error || message) && (
        <div
          className={`mb-8 flex items-start gap-3 rounded-2xl border p-4 ${
            error
              ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
              : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950'
          }`}
        >
          <AlertCircle
            className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
              error ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          />
          <div>
            <h3
              className={`font-semibold ${
                error ? 'text-red-900 dark:text-red-200' : 'text-emerald-900 dark:text-emerald-200'
              }`}
            >
              {error ? 'Flow operation failed' : 'Flow operation completed'}
            </h3>
            <p
              className={`text-sm ${
                error ? 'text-red-800 dark:text-red-300' : 'text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {error || message}
            </p>
          </div>
        </div>
      )}

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center justify-between">
              <Network className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Total
              </span>
            </div>
            <p className="text-3xl font-bold">{normalizedFlows.length}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Flow entries loaded from the backend
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center justify-between">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Active
              </span>
            </div>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {addedFlows.length}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Installed rules marked operational
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center justify-between">
              <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Pending
              </span>
            </div>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {pendingFlows.length}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Rules waiting for full activation
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center justify-between">
              <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Drop
              </span>
            </div>
            <p className="text-3xl font-bold">{dropRules}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Policies configured to block traffic
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-gray-400">Loading flows...</p>
            </div>
          ) : normalizedFlows.length === 0 ? (
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardContent className="py-12 text-center">
                <PlayCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">No flows configured</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                  Use the right-side form to create a new ONOS flow.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-xl">Installed Flow Rules</CardTitle>
                  <Badge variant="outline">Source: {source}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                          Flow ID
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                          Device
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                          Priority
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                          Match
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                          Action
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                          App
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {normalizedFlows.map((flow) => (
                        <tr
                          key={`${flow.deviceId}-${flow.flowId}`}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                        >
                          <td className="px-4 py-4 font-mono text-xs text-cyan-600 dark:text-cyan-400">
                            {flow.flowId}
                          </td>
                          <td className="px-4 py-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                            {flow.deviceId}
                          </td>
                          <td className="px-4 py-4">{flow.priority}</td>
                          <td className="px-4 py-4">
                            <Badge
                              className={
                                String(flow.state).toLowerCase().includes('added')
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                                  : String(flow.state).toLowerCase().includes('pending')
                                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300'
                                    : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300'
                              }
                            >
                              {flow.state}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-400">
                            {flow.matchSummary}
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-400">
                            {flow.actionSummary}
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400">
                            {flow.appId || 'unknown'}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-1 text-gray-500 hover:text-cyan-500"
                                title="Copy flow ID"
                                onClick={() => navigator.clipboard.writeText(flow.flowId)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-1 text-gray-500 hover:text-red-500"
                                title="Delete flow"
                                onClick={() => handleDeleteFlow(flow)}
                                disabled={deletingFlowId === flow.flowId}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-xl">Create ONOS Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Device ID</Label>
                <Input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} />
              </div>
              <div>
                <Label className="mb-2 block">App ID</Label>
                <Input value={appId} onChange={(e) => setAppId(e.target.value)} />
              </div>
              <div>
                <Label className="mb-2 block">Priority</Label>
                <Input value={priority} onChange={(e) => setPriority(e.target.value)} />
              </div>
              <div>
                <Label className="mb-2 block">EtherType</Label>
                <Input value={ethType} onChange={(e) => setEthType(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Input Port</Label>
                  <Input value={inPort} onChange={(e) => setInPort(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-2 block">Output Port</Label>
                  <Input value={outputPort} onChange={(e) => setOutputPort(e.target.value)} />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                <div>
                  <p className="font-medium">Permanent rule</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Use timeout only when this is disabled.
                  </p>
                </div>
                <Switch checked={isPermanent} onCheckedChange={setIsPermanent} />
              </div>

              {!isPermanent && (
                <div>
                  <Label className="mb-2 block">Timeout (sec)</Label>
                  <Input value={timeout} onChange={(e) => setTimeout(e.target.value)} />
                </div>
              )}

              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                onClick={handleCreateFlow}
                disabled={creating}
              >
                <Plus className="mr-2 h-4 w-4" />
                {creating ? 'Creating...' : 'Push Flow To ONOS'}
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This form now sends a real POST request to ONOS through the backend using the
                selected App ID.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-xl">Policy Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                Match summaries are built from ONOS selector criteria.
              </p>
              <p className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Delete now removes the selected flow from ONOS and from the local DB cache if
                present.
              </p>
              <p className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                Next step after this page: add groups, meters, flow objectives, and intent-related
                flow views.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </AuthenticatedShell>
  );
}
