'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Send, BarChart3, RefreshCw, FileText, AlertCircle } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

const defaultActions: QuickAction[] = [
  {
    id: 'deploy',
    label: 'Deploy Config',
    icon: <Send className="h-5 w-5" />,
    color:
      'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300',
  },
  {
    id: 'configure',
    label: 'Configure Device',
    icon: <Settings className="h-5 w-5" />,
    color:
      'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300',
  },
  {
    id: 'diagnostics',
    label: 'Run Diagnostics',
    icon: <BarChart3 className="h-5 w-5" />,
    color:
      'bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900 dark:hover:bg-cyan-800 text-cyan-700 dark:text-cyan-300',
  },
  {
    id: 'sync',
    label: 'Sync & Refresh',
    icon: <RefreshCw className="h-5 w-5" />,
    color:
      'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'report',
    label: 'Generate Report',
    icon: <FileText className="h-5 w-5" />,
    color:
      'bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300',
  },
  {
    id: 'incidents',
    label: 'View Incidents',
    icon: <AlertCircle className="h-5 w-5" />,
    color:
      'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300',
  },
];

interface QuickActionsProps {
  actions?: QuickAction[];
  title?: string;
}

export function QuickActions({
  actions = defaultActions,
  title = 'Quick Actions',
}: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={`h-auto flex flex-col items-center justify-center gap-2 py-4 px-2 border-0 ${action.color}`}
              onClick={action.onClick}
            >
              {action.icon}
              <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
