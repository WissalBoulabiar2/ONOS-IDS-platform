'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AuthenticatedShell } from '@/components/layout/authenticated-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sdnApi } from '@/services/api';
import {
  ChevronRight,
  CircleDot,
  Plus,
  Server,
  Terminal,
  Trash2,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';

interface DeviceOption {
  id: string;
  label: string;
}

interface ConnectForm {
  deviceId: string;
  host: string;
  port: string;
  username: string;
  password: string;
}

interface SshConnection {
  deviceId: string;
  host: string;
  port: number;
  username: string;
  password: string;
}

interface SshTab {
  id: string;
  label: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  errorMsg?: string;
  connection: SshConnection;
}

interface MountedTerminal {
  term: any;
  resizeObserver: ResizeObserver;
  dataListener: {
    dispose: () => void;
  };
}

const QUICK_COMMANDS = [
  { label: 'show interfaces', cmd: 'show interfaces\n' },
  { label: 'show ip route', cmd: 'show ip route\n' },
  { label: 'show running-config', cmd: 'show running-config\n' },
  { label: 'show version', cmd: 'show version\n' },
  { label: 'show ip ospf neighbor', cmd: 'show ip ospf neighbor\n' },
  { label: 'show flows', cmd: 'flows\n' },
  { label: 'devices', cmd: 'devices\n' },
  { label: 'links', cmd: 'links\n' },
];

function buildSshWsUrl() {
  const fallback = 'ws://localhost:5000/api/ssh/ws';

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const url = new URL(apiBaseUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = `${url.pathname.replace(/\/$/, '')}/ssh/ws`;
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return fallback;
  }
}

export default function TerminalPage() {
  const [tabs, setTabs] = useState<SshTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [devices, setDevices] = useState<DeviceOption[]>([]);
  const [form, setForm] = useState<ConnectForm>({
    deviceId: '',
    host: '',
    port: '22',
    username: '',
    password: '',
  });
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const terminalRefs = useRef<Record<string, MountedTerminal | undefined>>({});
  const wsRefs = useRef<Record<string, WebSocket | null>>({});

  useEffect(() => {
    void sdnApi
      .getDevices()
      .then((response) => {
        setDevices(
          response.devices.map((device) => ({
            id: device.id,
            label: device.id.split(':').pop() ?? device.id,
          }))
        );
      })
      .catch(() => {
        setDevices([]);
      });
  }, []);

  const cleanupTabResources = useCallback((tabId: string) => {
    wsRefs.current[tabId]?.close();
    delete wsRefs.current[tabId];

    const mounted = terminalRefs.current[tabId];
    if (mounted) {
      mounted.dataListener.dispose();
      mounted.resizeObserver.disconnect();
      mounted.term.dispose();
      delete terminalRefs.current[tabId];
    }

    delete containerRefs.current[tabId];
  }, []);

  useEffect(() => {
    return () => {
      Object.keys(wsRefs.current).forEach((tabId) => cleanupTabResources(tabId));
    };
  }, [cleanupTabResources]);

  const mountTerminal = useCallback(
    async (tabId: string, container: HTMLDivElement | null) => {
      if (!container || terminalRefs.current[tabId]) {
        return;
      }

      const tab = tabs.find((entry) => entry.id === tabId);
      if (!tab) {
        return;
      }

      const [{ Terminal: XtermTerminal }, { FitAddon }] = await Promise.all([
        import('@xterm/xterm'),
        import('@xterm/addon-fit'),
      ]);

      const term = new XtermTerminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        theme: {
          background: '#0a0f1a',
          foreground: '#e2e8f0',
          cursor: '#06b6d4',
          selectionBackground: '#06b6d433',
          black: '#0a0f1a',
          brightBlack: '#334155',
          red: '#ef4444',
          brightRed: '#f87171',
          green: '#10b981',
          brightGreen: '#34d399',
          yellow: '#f59e0b',
          brightYellow: '#fbbf24',
          blue: '#3b82f6',
          brightBlue: '#60a5fa',
          cyan: '#06b6d4',
          brightCyan: '#22d3ee',
          white: '#e2e8f0',
          brightWhite: '#f8fafc',
          magenta: '#8b5cf6',
          brightMagenta: '#a78bfa',
        },
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(container);
      fitAddon.fit();
      term.focus();

      const resizeObserver = new ResizeObserver(() => fitAddon.fit());
      resizeObserver.observe(container);

      const ws = new WebSocket(buildSshWsUrl());
      wsRefs.current[tabId] = ws;

      ws.onopen = () => {
        setTabs((previous) =>
          previous.map((entry) =>
            entry.id === tabId ? { ...entry, status: 'connecting', errorMsg: undefined } : entry
          )
        );

        ws.send(
          JSON.stringify({
            type: 'connect',
            host: tab.connection.host,
            port: tab.connection.port,
            username: tab.connection.username,
            password: tab.connection.password,
            deviceId: tab.connection.deviceId,
          })
        );

        term.write('\r\n\x1b[36mOpening SSH proxy session...\x1b[0m\r\n');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'ready' || message.type === 'connected') {
            setTabs((previous) =>
              previous.map((entry) =>
                entry.id === tabId ? { ...entry, status: 'connected', errorMsg: undefined } : entry
              )
            );
            term.write('\r\n\x1b[32mSSH session established\x1b[0m\r\n\r\n');
            return;
          }

          if (message.type === 'output') {
            term.write(message.data ?? '');
            return;
          }

          if (message.type === 'error') {
            setTabs((previous) =>
              previous.map((entry) =>
                entry.id === tabId
                  ? { ...entry, status: 'error', errorMsg: String(message.data || 'SSH error') }
                  : entry
              )
            );
            term.write(`\r\n\x1b[31m${message.data ?? 'SSH error'}\x1b[0m\r\n`);
          }
        } catch {
          term.write(String(event.data));
        }
      };

      ws.onclose = () => {
        setTabs((previous) =>
          previous.map((entry) =>
            entry.id === tabId && entry.status !== 'error'
              ? { ...entry, status: 'disconnected' }
              : entry
          )
        );
        term.write('\r\n\x1b[33mConnection closed\x1b[0m\r\n');
      };

      ws.onerror = () => {
        setTabs((previous) =>
          previous.map((entry) =>
            entry.id === tabId
              ? { ...entry, status: 'error', errorMsg: 'WebSocket error' }
              : entry
          )
        );
        term.write(
          '\r\n\x1b[31mWebSocket error. Ensure the SSH proxy is available at /api/ssh/ws.\x1b[0m\r\n'
        );
      };

      const dataListener = term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data }));
        }
      });

      terminalRefs.current[tabId] = {
        term,
        resizeObserver,
        dataListener,
      };
    },
    [tabs]
  );

  const openSession = () => {
    if (!form.host.trim() || !form.username.trim()) {
      setError('Host and username are required');
      return;
    }

    setConnecting(true);
    setError(null);

    const tabId = `tab-${Date.now()}`;
    const selectedDevice = devices.find((device) => device.id === form.deviceId);

    const newTab: SshTab = {
      id: tabId,
      label: selectedDevice?.label ?? form.host,
      status: 'connecting',
      connection: {
        deviceId: form.deviceId || form.host,
        host: form.host.trim(),
        port: Number.parseInt(form.port, 10) || 22,
        username: form.username.trim(),
        password: form.password,
      },
    };

    setTabs((previous) => [...previous, newTab]);
    setActiveTab(tabId);
    setShowForm(false);
    setConnecting(false);
  };

  const closeTab = (tabId: string) => {
    cleanupTabResources(tabId);

    setTabs((previous) => {
      const remaining = previous.filter((entry) => entry.id !== tabId);

      setActiveTab((current) => {
        if (current !== tabId) {
          return current;
        }

        return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
      });

      return remaining;
    });
  };

  const sendCommand = (command: string) => {
    if (!activeTab) {
      return;
    }

    const ws = wsRefs.current[activeTab];
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'input', data: command }));
    }
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <AuthenticatedShell contentClassName="max-w-7xl">
      <section className="mb-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge className="border-teal-400/20 bg-teal-400/10 text-teal-200">
                SSH Terminal
              </Badge>
              <Badge className="border-white/10 bg-white/5 text-slate-400">
                Xterm.js + WebSocket
              </Badge>
              {tabs.length > 0 && (
                <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                  {tabs.filter((tab) => tab.status === 'connected').length} active session(s)
                </Badge>
              )}
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
              <Terminal className="h-7 w-7 text-teal-300" />
              SSH Terminal
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Connect to any reachable device from the browser. The frontend is ready; the SSH
              proxy backend still needs to expose <code>/api/ssh/ws</code>.
            </p>
          </div>
          <Button
            onClick={() => setShowForm((value) => !value)}
            className="self-start bg-teal-600 text-white hover:bg-teal-700 sm:self-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            New session
          </Button>
        </div>
      </section>

      {showForm && (
        <Card className="mb-6 border-slate-700 bg-slate-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Server className="h-4 w-4 text-teal-400" />
                SSH connection
              </CardTitle>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded p-1 text-slate-500 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="mb-3 rounded border border-red-800 bg-red-950/40 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label className="mb-1.5 block text-xs text-slate-400">Device (optional)</Label>
                <Select
                  value={form.deviceId}
                  onValueChange={(value) => setForm((current) => ({ ...current, deviceId: value }))}
                >
                  <SelectTrigger className="border-slate-700 bg-slate-800 text-slate-200">
                    <SelectValue placeholder="Select from ONOS..." />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-900">
                    {devices.map((device) => (
                      <SelectItem key={device.id} value={device.id} className="text-slate-200">
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs text-slate-400">Host / IP *</Label>
                <Input
                  value={form.host}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, host: event.target.value }))
                  }
                  placeholder="192.168.1.1"
                  className="border-slate-700 bg-slate-800 text-slate-200 placeholder:text-slate-600"
                />
              </div>

              <div>
                <Label className="mb-1.5 block text-xs text-slate-400">Port</Label>
                <Input
                  value={form.port}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, port: event.target.value }))
                  }
                  placeholder="22"
                  className="border-slate-700 bg-slate-800 text-slate-200"
                />
              </div>

              <div>
                <Label className="mb-1.5 block text-xs text-slate-400">Username *</Label>
                <Input
                  value={form.username}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, username: event.target.value }))
                  }
                  placeholder="admin"
                  className="border-slate-700 bg-slate-800 text-slate-200 placeholder:text-slate-600"
                />
              </div>

              <div>
                <Label className="mb-1.5 block text-xs text-slate-400">Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="••••••••"
                  className="border-slate-700 bg-slate-800 text-slate-200"
                />
              </div>

              <div className="flex items-end">
                <Button
                  className="w-full bg-teal-600 text-white hover:bg-teal-700"
                  onClick={openSession}
                  disabled={connecting}
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  {connecting ? 'Connecting...' : 'Connect'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tabs.length === 0 && (
        <Card className="border-dashed border-slate-700 bg-slate-900/40">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Terminal className="mb-4 h-12 w-12 text-slate-600" />
            <p className="text-base font-medium text-slate-400">No active SSH sessions</p>
            <p className="mt-1 text-sm text-slate-600">
              Click &quot;New session&quot; to connect to a device
            </p>
            <Button
              className="mt-5 bg-teal-600 text-white hover:bg-teal-700"
              onClick={() => setShowForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Open session
            </Button>
          </CardContent>
        </Card>
      )}

      {tabs.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 p-1">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex min-w-[160px] items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <StatusDot status={tab.status} />
                  <span className="truncate">{tab.label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => closeTab(tab.id)}
                  className="rounded p-0.5 text-slate-500 hover:text-rose-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs text-slate-500 hover:text-slate-200"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          </div>

          {activeTabData?.status === 'connected' && (
            <div className="flex flex-wrap gap-1.5">
              <span className="mr-1 self-center text-xs text-slate-600">Quick:</span>
              {QUICK_COMMANDS.map((command) => (
                <button
                  key={command.label}
                  type="button"
                  onClick={() => sendCommand(command.cmd)}
                  className="rounded border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-400 transition-colors hover:border-teal-600/50 hover:bg-teal-950/40 hover:text-teal-300"
                >
                  {command.label}
                </button>
              ))}
            </div>
          )}

          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`overflow-hidden rounded-xl border border-slate-800 ${
                activeTab === tab.id ? 'block' : 'hidden'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
                <div className="flex items-center gap-2">
                  <StatusDot status={tab.status} />
                  <span className="text-xs font-medium text-slate-300">{tab.label}</span>
                  <span className="text-xs text-slate-600">{tab.connection.host}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${
                      tab.status === 'connected'
                        ? 'text-emerald-400'
                        : tab.status === 'connecting'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                    }`}
                  >
                    {tab.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => closeTab(tab.id)}
                    className="rounded p-1 text-slate-600 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div
                ref={(element) => {
                  containerRefs.current[tab.id] = element;
                  void mountTerminal(tab.id, element);
                }}
                style={{ height: 480, background: '#0a0f1a' }}
                className="p-2"
              />
            </div>
          ))}
        </div>
      )}

      <Card className="mt-6 border-slate-800 bg-slate-900/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">How it works</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-xs text-slate-500 sm:grid-cols-3">
          <div className="flex items-start gap-2">
            <CircleDot className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-teal-500" />
            <p>
              The browser uses WebSocket transport. A backend proxy must receive keyboard input and
              stream remote stdout back to Xterm.js.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Wifi className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-cyan-500" />
            <p>
              It is designed for OVS switches, Linux hosts and Cisco CSR1000V once the SSH proxy
              is wired to Paramiko or an equivalent backend.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <WifiOff className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-600" />
            <p>
              This repository does not yet expose <code>/api/ssh/ws</code>, so connections will
              remain pending until that backend piece is added.
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthenticatedShell>
  );
}

function StatusDot({ status }: { status: SshTab['status'] }) {
  const color =
    status === 'connected'
      ? 'bg-emerald-400'
      : status === 'connecting'
        ? 'bg-amber-400 animate-pulse'
        : status === 'disconnected'
          ? 'bg-slate-500'
          : 'bg-rose-400';

  return <span className={`h-2 w-2 flex-shrink-0 rounded-full ${color}`} />;
}
