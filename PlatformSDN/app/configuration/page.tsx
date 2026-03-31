"use client"

import React from "react"
import Navigation from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  AlertTriangle,
  Database,
  Gauge,
  RefreshCcw,
  Save,
  Server,
  Settings,
  Shield,
  TimerReset,
  Wifi,
} from "lucide-react"

const statusCards = [
  {
    title: "Controller Status",
    value: "Connected",
    description: "ONOS API reachable from the platform",
    icon: Server,
    accent: "text-emerald-400",
  },
  {
    title: "Collection Interval",
    value: "30 sec",
    description: "Polling frequency for topology and metrics",
    icon: TimerReset,
    accent: "text-cyan-400",
  },
  {
    title: "Alert Threshold",
    value: "90%",
    description: "Trigger warning for high port usage",
    icon: AlertTriangle,
    accent: "text-amber-400",
  },
  {
    title: "Storage Mode",
    value: "Frontend Mock",
    description: "Prepared for PostgreSQL integration later",
    icon: Database,
    accent: "text-violet-400",
  },
]

export default function ConfigurationPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      <Navigation />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                Platform Settings
              </Badge>
              <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                ONOS Connected
              </Badge>
            </div>
            <h1 className="mb-2 flex items-center gap-3 text-4xl font-bold">
              <Settings className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
              SDN Configuration Center
            </h1>
            <p className="max-w-2xl text-gray-600 dark:text-gray-400">
              Define controller access, metrics collection, alerting policy, and platform behavior before
              connecting the frontend to the full backend and database stack.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                <Wifi className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Environment Ready</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Frontend configuration prepared for live integration</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statusCards.map((card) => {
            const Icon = card.icon

            return (
              <Card key={card.title} className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`rounded-xl p-3 ${card.accent} bg-gray-100 dark:bg-gray-800`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                      Live
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                  <p className="mt-1 text-2xl font-bold">{card.value}</p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{card.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Server className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  ONOS Controller Access
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label className="mb-2 block">Controller URL</Label>
                  <Input defaultValue="http://localhost:8181" className="bg-white dark:bg-gray-950" />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Main REST endpoint used by the future backend proxy.
                  </p>
                </div>
                <div>
                  <Label className="mb-2 block">Username</Label>
                  <Input type="text" defaultValue="onos" className="bg-white dark:bg-gray-950" />
                </div>
                <div>
                  <Label className="mb-2 block">Password</Label>
                  <Input type="password" defaultValue="rocks" className="bg-white dark:bg-gray-950" />
                </div>
                <div>
                  <Label className="mb-2 block">Northbound API Path</Label>
                  <Input type="text" defaultValue="/onos/v1" className="bg-white dark:bg-gray-950" />
                </div>
                <div>
                  <Label className="mb-2 block">Connection Timeout (ms)</Label>
                  <Input type="number" defaultValue="5000" className="bg-white dark:bg-gray-950" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gauge className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  Collection And Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  <div>
                    <p className="font-medium">Enable Metrics Collection</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Poll topology, ports, flows, and health indicators from ONOS.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label className="mb-2 block">Polling Interval (sec)</Label>
                    <Input type="number" defaultValue="30" className="bg-white dark:bg-gray-950" />
                  </div>
                  <div>
                    <Label className="mb-2 block">Topology Refresh (sec)</Label>
                    <Input type="number" defaultValue="10" className="bg-white dark:bg-gray-950" />
                  </div>
                  <div>
                    <Label className="mb-2 block">Dashboard Refresh (sec)</Label>
                    <Input type="number" defaultValue="5" className="bg-white dark:bg-gray-950" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                    <div>
                      <p className="font-medium">Store Historical Snapshots</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Prepared for PostgreSQL persistence.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                    <div>
                      <p className="font-medium">Enable Realtime Updates</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reserved for future WebSocket integration.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  Alert Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  <div>
                    <p className="font-medium">Enable Alert Detection</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Prepare frontend thresholds for device loss, link down, and saturation.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label className="mb-2 block">High Usage Threshold (%)</Label>
                    <Input type="number" defaultValue="90" max="100" className="bg-white dark:bg-gray-950" />
                  </div>
                  <div>
                    <Label className="mb-2 block">Critical Usage Threshold (%)</Label>
                    <Input type="number" defaultValue="95" max="100" className="bg-white dark:bg-gray-950" />
                  </div>
                  <div>
                    <Label className="mb-2 block">Offline Device Delay (sec)</Label>
                    <Input type="number" defaultValue="60" className="bg-white dark:bg-gray-950" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-lg">Integration Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">Frontend configuration ready</p>
                  <p className="mt-1 text-emerald-600 dark:text-emerald-400">
                    UI structure is prepared for real backend and ONOS data.
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
                  <p className="font-semibold text-amber-700 dark:text-amber-300">Backend connection pending</p>
                  <p className="mt-1 text-amber-600 dark:text-amber-400">
                    API proxy, auth, and collection services will be added after frontend completion.
                  </p>
                </div>
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/40">
                  <p className="font-semibold text-violet-700 dark:text-violet-300">Database phase later</p>
                  <p className="mt-1 text-violet-600 dark:text-violet-400">
                    Historical metrics, alerts, and users will move to PostgreSQL afterwards.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/80 shadow-sm dark:border-red-900/50 dark:bg-red-950/20">
              <CardHeader>
                <CardTitle className="text-lg text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Use reset only when you want to discard controller settings and return to the initial lab configuration.
                </p>
                <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-100 dark:hover:bg-red-950">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset To Defaults
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
          <Button variant="outline">
            Preview Integration
          </Button>
        </div>
      </main>
    </div>
  )
}
