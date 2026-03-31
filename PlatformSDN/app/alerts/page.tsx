"use client"

import React, { useMemo, useState } from "react"
import Navigation from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAlerts, useRealtimeUpdates } from "@/hooks/sdn-hooks"
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock3,
  Filter,
  Radar,
  ShieldAlert,
  Siren,
  Trash2,
} from "lucide-react"

type ResolutionFilter = "all" | "open" | "resolved"
type SeverityFilter = "all" | "critical" | "warning" | "info"

export default function AlertsPage() {
  const { alerts, loading } = useAlerts()
  const timestamp = useRealtimeUpdates(5000)
  const [resolutionFilter, setResolutionFilter] = useState<ResolutionFilter>("open")
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all")

  const openAlerts = alerts.filter((alert) => !alert.resolved)
  const criticalAlerts = openAlerts.filter((alert) => alert.severity === "critical")
  const warningAlerts = openAlerts.filter((alert) => alert.severity === "warning")
  const infoAlerts = openAlerts.filter((alert) => alert.severity === "info")

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const resolutionMatches =
        resolutionFilter === "all" ||
        (resolutionFilter === "open" && !alert.resolved) ||
        (resolutionFilter === "resolved" && alert.resolved)

      const severityMatches =
        severityFilter === "all" || alert.severity === severityFilter

      return resolutionMatches && severityMatches
    })
  }, [alerts, resolutionFilter, severityFilter])

  const latestIncident = filteredAlerts[0]

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-950 via-rose-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="border-rose-400/20 bg-rose-400/10 text-rose-100">
                  Incident Monitoring
                </Badge>
                <Badge className="border-amber-400/20 bg-amber-400/10 text-amber-100">
                  Realtime Review
                </Badge>
              </div>
              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
                Network Alerts Center
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Review active incidents, track warning signals, and prepare the frontend for live alerting
                from ONOS, backend rules, and database-backed history.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:min-w-[300px]">
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-rose-100">Latest refresh</p>
              <p className="text-2xl font-semibold">{timestamp ? timestamp.toLocaleTimeString() : "--:--:--"}</p>
              <p className="mt-2 text-sm text-slate-300">
                Alert polling is simulated for now and will later be replaced by WebSocket and backend events.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-200">
                <Radar className="h-4 w-4 text-cyan-300" />
                <span>{openAlerts.length} active incidents under supervision</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <BellRing className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Open</span>
              </div>
              <p className="text-3xl font-bold">{openAlerts.length}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Incidents still awaiting operator action</p>
            </CardContent>
          </Card>

          <Card className="border-rose-200 bg-rose-50/80 shadow-sm dark:border-rose-900/70 dark:bg-rose-950/30">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Siren className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-rose-500 dark:text-rose-300">Critical</span>
              </div>
              <p className="text-3xl font-bold">{criticalAlerts.length}</p>
              <p className="mt-1 text-sm text-rose-700 dark:text-rose-200">Major disruptions requiring immediate review</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/80 shadow-sm dark:border-amber-900/70 dark:bg-amber-950/30">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-amber-500 dark:text-amber-300">Warning</span>
              </div>
              <p className="text-3xl font-bold">{warningAlerts.length}</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">Early signals that may degrade the topology</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/80 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/30">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-300">Resolved</span>
              </div>
              <p className="text-3xl font-bold">{alerts.length - openAlerts.length}</p>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">Historical incidents already closed</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-xl">Alert Feed</CardTitle>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Filter incidents by resolution state and severity to prepare the future operations view.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["all", "open", "resolved"] as const).map((value) => (
                      <Button
                        key={value}
                        size="sm"
                        variant={resolutionFilter === value ? "default" : "outline"}
                        onClick={() => setResolutionFilter(value)}
                        className={
                          resolutionFilter === value
                            ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        }
                      >
                        <Filter className="mr-2 h-4 w-4" />
                        {value === "all" ? "All" : value === "open" ? "Open" : "Resolved"}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-5 flex flex-wrap gap-2">
                  {(["all", "critical", "warning", "info"] as const).map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant="outline"
                      onClick={() => setSeverityFilter(value)}
                      className={
                        severityFilter === value
                          ? "border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300"
                          : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      }
                    >
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Button>
                  ))}
                </div>

                {loading ? (
                  <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-950">
                    <p className="text-gray-500 dark:text-gray-400">Loading alerts...</p>
                  </div>
                ) : filteredAlerts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
                    <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
                    <p className="text-lg font-semibold">No alerts for the current filter</p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      This is the target state once the platform is connected to live network telemetry.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAlerts.map((alert) => {
                      const severityStyles = {
                        critical:
                          "border-rose-200 bg-rose-50 dark:border-rose-900/70 dark:bg-rose-950/20",
                        warning:
                          "border-amber-200 bg-amber-50 dark:border-amber-900/70 dark:bg-amber-950/20",
                        info:
                          "border-cyan-200 bg-cyan-50 dark:border-cyan-900/70 dark:bg-cyan-950/20",
                      }

                      return (
                        <div
                          key={alert.id}
                          className={`rounded-3xl border p-5 transition-colors ${severityStyles[alert.severity]}`}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  className={
                                    alert.severity === "critical"
                                      ? "bg-rose-600 text-white hover:bg-rose-600"
                                      : alert.severity === "warning"
                                        ? "bg-amber-500 text-slate-950 hover:bg-amber-500"
                                        : "bg-cyan-600 text-white hover:bg-cyan-600"
                                  }
                                >
                                  {alert.severity.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {alert.type.replaceAll("_", " ")}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={alert.resolved ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}
                                >
                                  {alert.resolved ? "Resolved" : "Open"}
                                </Badge>
                              </div>

                              <div>
                                <p className="text-base font-semibold">{alert.message}</p>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                  Alert source {alert.deviceId ? `for device ${alert.deviceId}` : "from topology monitoring"}.
                                </p>
                              </div>

                              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                                <div className="rounded-2xl bg-white/60 p-3 dark:bg-gray-950/60">
                                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Created</p>
                                  <p className="mt-2 font-medium">{formatAlertTimestamp(alert.createdAt)}</p>
                                </div>
                                <div className="rounded-2xl bg-white/60 p-3 dark:bg-gray-950/60">
                                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Device</p>
                                  <p className="mt-2 font-mono text-xs sm:text-sm">{alert.deviceId ?? "Topology-wide"}</p>
                                </div>
                                <div className="rounded-2xl bg-white/60 p-3 dark:bg-gray-950/60">
                                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Resolved</p>
                                  <p className="mt-2 font-medium">
                                    {alert.resolvedAt ? formatAlertTimestamp(alert.resolvedAt) : "Pending"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="self-start text-gray-500 hover:text-rose-500 dark:text-gray-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-xl">Incident Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestIncident ? (
                  <>
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Latest event</p>
                      <p className="mt-2 text-sm font-semibold">{latestIncident.message}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Severity</p>
                        <p className="mt-2 text-sm font-semibold capitalize">{latestIncident.severity}</p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Type</p>
                        <p className="mt-2 text-sm font-semibold capitalize">
                          {latestIncident.type.replaceAll("_", " ")}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This panel can later show correlated metrics, port counters, and remediation actions from the backend.
                    </p>
                  </>
                ) : (
                  <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                    No incident is available for the current filter.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-xl">Response Guidance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="mt-0.5 h-4 w-4 text-rose-500" />
                  <p>Critical alerts should later trigger notifications, escalation, and operator acknowledgement.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-amber-500" />
                  <p>Warning events can be kept visible to detect early congestion, link degradation, or controller issues.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Radar className="mt-0.5 h-4 w-4 text-cyan-500" />
                  <p>Once the backend is connected, this page can merge ONOS events, cron checks, and stored history.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-xl">Current Mix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950">
                  <span>Critical</span>
                  <span className="font-semibold">{criticalAlerts.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950">
                  <span>Warning</span>
                  <span className="font-semibold">{warningAlerts.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950">
                  <span>Info</span>
                  <span className="font-semibold">{infoAlerts.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}

function formatAlertTimestamp(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value))
}
