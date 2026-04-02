'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Bell, Search, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from './user-menu';

interface Breadcrumb {
  label: string;
  href?: string;
}

function generateBreadcrumbs(pathname: string): Breadcrumb[] {
  const breadcrumbs: Breadcrumb[] = [];

  // Always start with Dashboard
  breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' });

  // Parse pathname and create breadcrumbs
  const segments = pathname.split('/').filter(Boolean);

  // Skip if we're already on dashboard
  if (segments.length === 1 && segments[0] === 'dashboard') {
    return breadcrumbs;
  }

  // Add segments to breadcrumbs
  let currentPath = '';
  for (const segment of segments) {
    if (segment === 'dashboard') continue;

    currentPath += `/${segment}`;

    // Create readable label
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({ label, href: currentPath });
  }

  return breadcrumbs;
}

export function AppHeader() {
  const pathname = usePathname();
  const breadcrumbs = useMemo(() => generateBreadcrumbs(pathname), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wifi className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold">PlatformSDN</p>
            <p className="text-xs text-muted-foreground">ONOS Controller</p>
          </div>
        </Link>

        {/* Breadcrumb */}
        <div className="flex-1 px-4">
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-muted-foreground">/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Search */}
        <div className="hidden md:flex">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search devices, flows, alerts..." className="pl-8 h-9" />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-critical" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
