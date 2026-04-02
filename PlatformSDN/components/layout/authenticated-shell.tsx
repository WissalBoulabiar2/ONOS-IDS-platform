'use client';

import type React from 'react';
import { cn } from '@/lib/utils';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';

export function AuthenticatedShell({
  children,
  contentClassName,
  mainId,
}: {
  children: React.ReactNode;
  contentClassName?: string;
  mainId?: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-64px)]">
        <AppSidebar />
        <main id={mainId} className="min-w-0 flex-1 overflow-y-auto">
          <div className={cn('mx-auto w-full px-4 py-8 sm:px-6 lg:px-8', contentClassName)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
