'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  status?: 'healthy' | 'warning' | 'critical'; // Green, Orange, Red
  trend?: number; // percentage change
  icon?: React.ReactNode;
  subtitle?: string;
}

export function KPICard({
  title,
  value,
  unit = '',
  status = 'healthy',
  trend,
  icon,
  subtitle,
}: KPICardProps) {
  const statusColors = {
    healthy: {
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: 'text-emerald-600 dark:text-emerald-400',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      icon: 'text-amber-600 dark:text-amber-400',
    },
    critical: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
    },
  };

  const colors = statusColors[status];
  const isTrendingUp = trend && trend > 0;

  return (
    <Card className={`border-2 ${colors.border} ${colors.bg}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </CardTitle>
          {icon && <div className={`${colors.icon}`}>{icon}</div>}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${colors.text}`}>{value}</span>
          {unit && <span className="text-sm text-gray-600 dark:text-gray-400">{unit}</span>}
        </div>

        {subtitle && <p className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>}

        {trend !== undefined && (
          <div className="flex items-center gap-1 pt-2">
            {isTrendingUp ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  {trend > 0 ? '+' : ''}
                  {trend}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-red-600 dark:text-red-400">{trend}%</span>
              </>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-500">vs last 24h</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
