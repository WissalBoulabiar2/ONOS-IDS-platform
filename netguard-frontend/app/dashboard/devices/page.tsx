'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { apiClient } from '@/lib/api';
import {
  Server, RefreshCw, Wifi, WifiOff,
  MapPin, Cpu, HardDrive, RotateCcw
} from 'lucide-react';

interface Device {
  id: string;
  onos_id?: string;
  name: string;
  type?: string;
  ip_address?: string;
  status: 'active' | 'inactive' | 'unknown';
  manufacturer?: string;
  sw_version?: string;
  location?: string;
  last_seen?: string;
  updated_at: string;
}

const STATUS_STYLES = {
  active:   'bg-green-500/20 text-green-400 border-green-500/30',
  inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
  unknown:  'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export default function DevicesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selected, setSelected] = useState<Device | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient('/devices');
      if (res.ok) setDevices(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const syncFromOnos = async () => {
    if (!['admin', 'manager'].includes(user?.role ?? '')) return;
    setSyncing(true);
    try {
      const res = await apiClient('/devices/sync', { method: 'POST' });
      if (res.ok) await fetchDevices();
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (user) fetchDevices();
  }, [user, fetchDevices]);

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleString('en-GB', {
      day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit',
    }) : '—';

  const active = devices.filter(d => d.status === 'active').length;
  const inactive = devices.filter(d => d.status === 'inactive').length;

  if (isLoading || !user) return null;

  const canSync = ['admin', 'manager'].includes(user.role);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Network Devices</h1>
          <p className="mt-1 text-sm text-slate-400">
            SDN switches and endpoints managed by ONOS
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canSync && (
            <button
              onClick={syncFromOnos}
              disabled={syncing}
              className="flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-sm text-white hover:bg-cyan-600 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              Sync from ONOS
            </button>
          )}
          <button
            onClick={fetchDevices}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm text-slate-400">Total Devices</p>
          <p className="mt-1 text-2xl font-bold text-white">{devices.length}</p>
        </div>
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
          <p className="text-sm text-green-400">Active</p>
          <p className="mt-1 text-2xl font-bold text-white">{active}</p>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">Inactive</p>
          <p className="mt-1 text-2xl font-bold text-white">{inactive}</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Devices Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {devices.map(device => (
                <div
                  key={device.id}
                  onClick={() => setSelected(device)}
                  className={`cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition-all hover:border-slate-600 ${
                    selected?.id === device.id ? 'border-cyan-500/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`rounded-xl p-3 ${
                      device.status === 'active'
                        ? 'bg-cyan-500/10'
                        : 'bg-slate-700/50'
                    }`}>
                      <Server className={`h-6 w-6 ${
                        device.status === 'active' ? 'text-cyan-400' : 'text-slate-500'
                      }`} />
                    </div>
                    <span className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs ${STATUS_STYLES[device.status]}`}>
                      {device.status === 'active'
                        ? <Wifi className="h-3 w-3" />
                        : <WifiOff className="h-3 w-3" />
                      }
                      {device.status}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="font-semibold text-white">{device.name}</p>
                    <p className="text-xs text-slate-500">{device.onos_id}</p>
                  </div>

                  <div className="mt-3 space-y-1">
                    {device.manufacturer && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Cpu className="h-3 w-3" />
                        {device.manufacturer}
                      </div>
                    )}
                    {device.sw_version && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <HardDrive className="h-3 w-3" />
                        v{device.sw_version}
                      </div>
                    )}
                    {device.location && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {device.location}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 border-t border-slate-800 pt-3">
                    <p className="text-[10px] text-slate-600">
                      Updated {formatDate(device.updated_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-72 shrink-0">
            <div className="sticky top-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-white">Device Detail</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="text-white">{selected.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">ONOS ID</p>
                  <p className="font-mono text-xs text-cyan-400 break-all">{selected.onos_id || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <span className={`inline-block rounded-lg border px-2 py-0.5 text-xs ${STATUS_STYLES[selected.status]}`}>
                    {selected.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Type</p>
                    <p className="text-xs text-white">{selected.type || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">IP</p>
                    <p className="font-mono text-xs text-white">{selected.ip_address || '—'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Manufacturer</p>
                  <p className="text-xs text-white">{selected.manufacturer || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">SW Version</p>
                  <p className="text-xs text-white">{selected.sw_version || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Last Updated</p>
                  <p className="text-xs text-slate-300">{formatDate(selected.updated_at)}</p>
                </div>
              </div>

              {/* Sync button in detail */}
              {canSync && (
                <div className="mt-5 space-y-2">
                  <button
                    onClick={syncFromOnos}
                    disabled={syncing}
                    className="w-full rounded-xl bg-cyan-700/20 px-3 py-2 text-sm text-cyan-400 hover:bg-cyan-700/30 transition-colors"
                  >
                    Sync this device
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}