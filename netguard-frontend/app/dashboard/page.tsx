'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { apiClient } from '@/lib/api';
import {
  Shield, AlertTriangle, Activity, Server,
  LogOut, User, Wifi, Brain
} from 'lucide-react';

interface Stats {
  total_alerts: number;
  open_alerts: number;
  critical_alerts: number;
  total_devices: number;
  active_devices: number;
  total_flows: number;
  anomalies_24h: number;
  alerts_by_severity: Record<string, number>;
}


export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await apiClient('/dashboard/stats');
        if (res.ok) setStats(await res.json());
      } finally {
        setLoadingStats(false);
      }
    })();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (isLoading || !user) return null;

  const cards = [
    {
      label: 'Total Alerts',
      value: stats?.total_alerts ?? '—',
      sub: `${stats?.open_alerts ?? 0} open`,
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Critical Alerts',
      value: stats?.critical_alerts ?? '—',
      sub: 'Last 24h',
      icon: Shield,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Devices',
      value: stats?.total_devices ?? '—',
      sub: `${stats?.active_devices ?? 0} active`,
      icon: Server,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Flow Rules',
      value: stats?.total_flows ?? '—',
      sub: 'ONOS flows',
      icon: Wifi,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'AI Anomalies',
      value: stats?.anomalies_24h ?? '—',
      sub: 'Last 24h',
      icon: Brain,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'System Status',
      value: 'Online',
      sub: 'All systems',
      icon: Activity,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
  ];

  const severityColors: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
    info: 'bg-slate-500',
  };

  return (
  <div className="p-8">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
      <p className="mt-1 text-sm text-slate-400">
        Real-time overview of your SDN network security
      </p>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {loadingStats ? <span className="text-slate-600">...</span> : card.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
            </div>
            <div className={`rounded-xl p-3 ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Alerts by Severity */}
    {stats && (
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Alerts by Severity</h2>
        <div className="space-y-3">
          {Object.entries(stats.alerts_by_severity).map(([sev, count]) => {
            const total = stats.total_alerts || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={sev} className="flex items-center gap-3">
                <span className="w-16 text-xs capitalize text-slate-400">{sev}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-2 rounded-full transition-all ${severityColors[sev] ?? 'bg-slate-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-slate-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);
}