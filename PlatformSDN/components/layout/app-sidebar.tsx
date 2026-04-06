'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  AppWindow,
  GitBranch,
  HardDrive,
  LayoutDashboard,
  Menu,
  Network,
  Settings,
  Shield,
  Terminal,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  {
    group: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/topology', label: 'Topology', icon: GitBranch },
    ],
  },
  {
    group: 'Network',
    items: [
      { href: '/devices', label: 'Devices', icon: HardDrive },
      { href: '/flows', label: 'Flows', icon: Zap },
      { href: '/services', label: 'VPLS Services', icon: Network },
      { href: '/applications', label: 'Applications', icon: AppWindow },
    ],
  },
  {
    group: 'Security & AI',
    items: [
      { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
      { href: '/ai-security', label: 'AI Detection', icon: Shield },
    ],
  },
  {
    group: 'Tools',
    items: [
      { href: '/terminal', label: 'SSH Terminal', icon: Terminal },
      { href: '/metrics', label: 'Metrics', icon: Activity },
    ],
  },
  {
    group: 'Admin',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/configuration', label: 'Configuration', icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 left-4 z-40 border border-slate-800 bg-slate-950 text-slate-200 shadow-lg lg:hidden"
        onClick={() => setIsOpen((value) => !value)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <aside
        className={`fixed left-0 top-16 z-30 h-[calc(100vh-64px)] w-56 flex-shrink-0 border-r border-slate-800 bg-slate-950 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:flex`}
      >
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((group) => (
            <div key={group.group} className="mb-5">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          active
                            ? 'bg-cyan-500/10 text-cyan-400'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 flex-shrink-0 ${
                            active ? 'text-cyan-400' : 'text-slate-500'
                          }`}
                        />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 top-16 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
