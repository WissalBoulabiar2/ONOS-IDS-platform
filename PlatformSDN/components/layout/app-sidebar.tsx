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
import { cn } from '@/lib/utils';

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
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 left-4 z-40 border border-border bg-background text-foreground shadow-lg lg:hidden"
        onClick={() => setIsOpen((v) => !v)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-30 flex h-[calc(100vh-64px)] w-56 flex-shrink-0 flex-col',
          'border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
          'transition-transform duration-300',
          // On large screens: static in the flex row, full height fills the parent (h-full)
          'lg:static lg:z-auto lg:h-full lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand accent strip */}
        <div className="flex h-1 w-full flex-shrink-0 overflow-hidden rounded-none">
          <div className="flex-1 bg-cyan-500" />
          <div className="w-4 bg-emerald-500" />
          <div className="w-4 bg-cyan-400" />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((group) => (
            <div key={group.group} className="mb-5">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 flex-shrink-0',
                            active
                              ? 'text-cyan-600 dark:text-cyan-400'
                              : 'text-muted-foreground'
                          )}
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

        {/* Footer status */}
        <div className="flex-shrink-0 border-t border-sidebar-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">ONOS Controller</span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
