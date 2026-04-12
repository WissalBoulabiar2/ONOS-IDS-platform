'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import {
  LayoutDashboard, Network, AlertTriangle, Server,
  Brain, AppWindow, Users, LogOut, Shield, Activity, Radio, Target, MessageSquare, FileText, ShieldAlert, Settings, Terminal, BarChart2,   
} from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'manager', 'viewer'],
  },
  {
    label: 'Topology',
    href: '/dashboard/topology',
    icon: Network,
    roles: ['admin', 'manager', 'viewer'],
  },
  {
    label: 'Alerts',
    href: '/dashboard/alerts',
    icon: AlertTriangle,
    roles: ['admin', 'manager', 'viewer'],
  },
  {
    label: 'Devices',
    href: '/dashboard/devices',
    icon: Server,
    roles: ['admin', 'manager', 'viewer'],
  },
  {
  label: 'Config',
  href: '/dashboard/config',
  icon: Settings,
  roles: ['admin', 'manager'],
},
{
  label: 'CLI Terminal',
  href: '/dashboard/cli',
  icon: Terminal,
  roles: ['admin', 'manager'],
},
  {
  label: 'Vulnerability',
  href: '/dashboard/vulnerability',
  icon: ShieldAlert,
  roles: ['admin', 'manager', 'viewer'],
},
  {
    label: 'SIEM',                          // ← ajoute ici
    href: '/dashboard/siem',
    icon: Activity,
    roles: ['admin', 'manager', 'viewer'],
  },
  {
  label: 'Threat Intel',
  href: '/dashboard/threat-intel',
  icon: Radio,
  roles: ['admin', 'manager', 'viewer'],
},
{
  label: 'MITRE ATT&CK',
  href: '/dashboard/mitre',
  icon: Target,
  roles: ['admin', 'manager', 'viewer'],
},
{
  label: 'Network Flows',
  href: '/dashboard/network-flows',
  icon: BarChart2,
  roles: ['admin', 'manager', 'viewer'],
},
{
  label: 'SOC Chatbot',
  href: '/dashboard/chatbot',
  icon: MessageSquare,
  roles: ['admin', 'manager', 'viewer'],
},
  {
    label: 'AI Detection',
    href: '/dashboard/ai-detection',
    icon: Brain,
    roles: ['admin', 'manager', 'viewer'],
  },
  {
    label: 'ONOS Apps',
    href: '/dashboard/onos-apps',
    icon: AppWindow,
    roles: ['admin', 'manager'],
  },
  {
  label: 'Audit Trail',
  href: '/dashboard/audit',
  icon: FileText,
  roles: ['admin', 'manager'],
},
  {
    label: 'Users',
    href: '/dashboard/users',
    icon: Users,
    roles: ['admin'],
  },
];
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const filtered = navItems.filter(item =>
    item.roles.includes(user?.role ?? '')
  );

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-950">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-700">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Alliance Software</p>
          <p className="text-[10px] text-slate-500">Projet PFE</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {filtered.map(item => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-cyan-700/20 text-cyan-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
              {item.label}
              {item.label === 'Alerts' && (
                <span className="ml-auto rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-400">
                  live
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status */}
      <div className="border-t border-slate-800 px-3 py-3">
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2">
          <Activity className="h-3 w-3 text-green-400" />
          <span className="text-[10px] text-slate-400">ONOS Connected</span>
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        </div>

        {/* User */}
        <div className="mb-2 rounded-xl bg-slate-900 px-3 py-2">
          <p className="text-xs font-medium text-white">{user?.username}</p>
          <p className="text-[10px] text-slate-500">{user?.email}</p>
          <span className="mt-1 inline-block rounded-md bg-cyan-700/20 px-1.5 py-0.5 text-[10px] text-cyan-400">
            {user?.role}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}