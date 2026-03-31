"use client"

import React, { useState } from "react"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertBadge } from "@/components/AlertBadge"
import { useAlerts } from "@/hooks/sdn-hooks"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Filter,
} from "lucide-react"

export default function AlertsPage() {
  const { alerts, loading } = useAlerts()
  const [filterResolved, setFilterResolved] = useState<"all" | "open" | "resolved">("open")

  const filteredAlerts = alerts.filter((alert) => {
    if (filterResolved === "open") return !alert.resolved
    if (filterResolved === "resolved") return alert.resolved
    return true
  })

  const openCount = alerts.filter((a) => !a.resolved).length
  const criticalCount = openCount > 0 ? alerts.filter((a) => !a.resolved && a.severity === "critical").length : 0
  const warningCount = openCount > 0 ? alerts.filter((a) => !a.resolved && a.severity === "warning").length : 0

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Alerts</h1>
          <p className="text-gray-400">Monitor and manage network alerts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {openCount}
                </div>
                <p className="text-xs text-gray-400">Open Alerts</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-950/50 border-red-900/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-1">
                  {criticalCount}
                </div>
                <p className="text-xs text-red-300/70">Critical</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-950/50 border-yellow-900/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {warningCount}
                </div>
                <p className="text-xs text-yellow-300/70">Warnings</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-1">
                  {alerts.length - openCount}
                </div>
                <p className="text-xs text-gray-400">Resolved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {(["all", "open", "resolved"] as const).map((status) => (
            <Button
              key={status}
              variant={filterResolved === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterResolved(status)}
              className={
                filterResolved === status
                  ? "bg-cyan-600 hover:bg-cyan-700 border-cyan-600"
                  : "border-gray-600 text-gray-300 hover:bg-gray-800"
              }
            >
              <Filter className="h-4 w-4 mr-2" />
              {status === "all" && "All"}
              {status === "open" && "Open"}
              {status === "resolved" && "Resolved"}
            </Button>
          ))}
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <p className="text-gray-400">No alerts found</p>
              <p className="text-gray-500 text-sm mt-1">
                {filterResolved === "open"
                  ? "Your network is running smoothly!"
                  : "No resolved alerts"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <AlertBadge alert={alert} size="md" />
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400">
                        {alert.deviceId && (
                          <div>
                            <p className="text-gray-500 uppercase text-[10px]">Device</p>
                            <p className="text-white font-mono">{alert.deviceId}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-500 uppercase text-[10px]">Created</p>
                          <p className="text-white">
                            {new Date(alert.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {alert.resolvedAt && (
                          <div>
                            <p className="text-gray-500 uppercase text-[10px]">Resolved</p>
                            <p className="text-white">
                              {new Date(alert.resolvedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
