"use client"

import React, { useMemo, useState } from "react"
import Navigation from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFlows } from "@/hooks/sdn-hooks"
import {
  Activity,
  Copy,
  Filter,
  Network,
  Plus,
  PlayCircle,
  Shield,
  Trash2,
  Zap,
} from "lucide-react"

export default function FlowsPage() {
  const { flows, loading } = useFlows()
  const [deviceId, setDeviceId] = useState("of:0000000000000001")
  const [priority, setPriority] = useState("40000")
  const [inPort, setInPort] = useState("1")
  const [outputPort, setOutputPort] = useState("2")

  const addedFlows = flows.filter((f) => f.state === "added")
  const pendingFlows = flows.filter((f) => f.state === "pending")
  const dropRules = flows.filter((f) => f.action.drop).length

  const normalizedFlows = useMemo(
    () =>
      flows.map((flow) => ({
        ...flow,
        matchSummary: Object.entries(flow.match)
          .map(([key, value]) => `${key}: ${value}`)
          .join(" | "),
        actionSummary: flow.action.drop
          ? "drop"
          : flow.action.output
            ? `output:${flow.action.output}`
            : "custom",
      })),
    [flows]
  )

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                  OpenFlow Policy
                </Badge>
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  Rule Management
                </Badge>
              </div>
              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">Flow Rules Console</h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Review forwarding rules, inspect matching criteria, and prepare the frontend for future POST
                and DELETE operations against ONOS through the backend API.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:min-w-[280px]">
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-cyan-200">Policy status</p>
              <p className="text-2xl font-semibold">
                {pendingFlows.length > 0 ? `${pendingFlows.length} pending update(s)` : "Rules synchronized"}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Flow creation is mocked now and will later be connected to the ONOS backend endpoint.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Network className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Total</span>
              </div>
              <p className="text-3xl font-bold">{flows.length}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Flow entries visible in the policy table</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Active</span>
              </div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{addedFlows.length}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Installed rules marked as operational</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Pending</span>
              </div>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{pendingFlows.length}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Rules waiting for full activation</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Drop</span>
              </div>
              <p className="text-3xl font-bold">{dropRules}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Policies configured to block traffic</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="space-y-8 xl:col-span-2">
            {loading ? (
              <div className="py-12 text-center">
                <p className="text-gray-400">Loading flows...</p>
              </div>
            ) : flows.length === 0 ? (
              <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
                <CardContent className="py-12 text-center">
                  <PlayCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">No flows configured</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                    Create a new flow rule to start policy management.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="text-xl">Installed Flow Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                          <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Flow ID</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Device</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Priority</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Match</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Action</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">App</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {normalizedFlows.map((flow) => (
                          <tr
                            key={flow.id}
                            className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                          >
                            <td className="px-4 py-4 font-mono text-xs text-cyan-600 dark:text-cyan-400">
                              {flow.flowId}
                            </td>
                            <td className="px-4 py-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                              {flow.deviceId}
                            </td>
                            <td className="px-4 py-4">{flow.priority}</td>
                            <td className="px-4 py-4">
                              <Badge
                                className={
                                  flow.state === "added"
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                                    : flow.state === "pending"
                                      ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                                      : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300"
                                }
                              >
                                {flow.state}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-400">
                              {flow.matchSummary || "any"}
                            </td>
                            <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-400">
                              {flow.actionSummary}
                            </td>
                            <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400">{flow.appId}</td>
                            <td className="px-4 py-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="p-1 text-gray-500 hover:text-cyan-500"
                                  title="Duplicate flow"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="p-1 text-gray-500 hover:text-red-500"
                                  title="Delete flow"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-xl">Create Mock Flow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Device ID</Label>
                  <Input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-2 block">Priority</Label>
                  <Input value={priority} onChange={(e) => setPriority(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Input Port</Label>
                    <Input value={inPort} onChange={(e) => setInPort(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-2 block">Output Port</Label>
                    <Input value={outputPort} onChange={(e) => setOutputPort(e.target.value)} />
                  </div>
                </div>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Stage New Flow
                </Button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This form is frontend-only for now. Later it will submit to the backend endpoint that talks to ONOS.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-xl">Policy Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  Match fields currently shown from mock ONOS-like data.
                </p>
                <p className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Active rules represent forwarding policies ready for enforcement.
                </p>
                <p className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  Drop actions will later help demonstrate access control and traffic filtering.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
