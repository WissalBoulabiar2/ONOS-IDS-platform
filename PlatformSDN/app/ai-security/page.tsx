'use client';

import { AuthenticatedShell } from '@/components/layout/authenticated-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Shield, Siren, Workflow } from 'lucide-react';

const PIPELINE = [
  'ONOS App collects flow statistics and extracts the 82 traffic features.',
  'FastAPI loads Random Forest and XGBoost models to score the flows.',
  'The central platform stores alerts, enriches them and prepares remediation.',
  'Critical events are surfaced in the UI and can trigger automated policy actions.',
];

const CAPABILITIES = [
  'DDoS and anomaly detection workflow',
  'Confidence-based alert severity',
  'Automatic rule injection after validation',
  'Historical investigation for recurring attacks',
];

export default function AiSecurityPage() {
  return (
    <AuthenticatedShell contentClassName="max-w-7xl">
      <section className="mb-8 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge className="border-rose-400/20 bg-rose-400/10 text-rose-200">
                AI Security Module
              </Badge>
              <Badge className="border-amber-400/20 bg-amber-400/10 text-amber-200">
                Integration in progress
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">AI Detection</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              This page represents the intelligent security layer of your SDN platform and the
              bridge between ONOS telemetry, FastAPI inference and automated remediation.
            </p>
          </div>
          <Shield className="h-14 w-14 text-rose-300" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Workflow className="h-5 w-5 text-cyan-400" />
              Detection Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PIPELINE.map((step, index) => (
              <div key={step} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Step {index + 1}</p>
                <p className="mt-1 text-sm text-slate-200">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-violet-400" />
              Planned Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {CAPABILITIES.map((item) => (
              <div key={item} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
            <div className="rounded-xl border border-dashed border-amber-700/50 bg-amber-950/20 p-4 text-sm text-amber-200">
              Current repository status: the alert pages and dashboard are present, but the full
              ML-to-remediation loop still needs dedicated backend orchestration.
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Siren className="h-5 w-5 text-rose-400" />
              What this page should become
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Live</p>
              <p className="mt-2 text-sm text-slate-200">
                Incoming alerts, confidence score, affected devices and recommended action.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Analytics</p>
              <p className="mt-2 text-sm text-slate-200">
                Trends by attack type, device exposure and confidence distribution over time.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Action</p>
              <p className="mt-2 text-sm text-slate-200">
                Resolve alerts, annotate incidents and inject OpenFlow rules when approved.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </AuthenticatedShell>
  );
}
