"use client"

import React from "react"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFlows } from "@/hooks/sdn-hooks"
import { Plus, Trash2, Copy, PlayCircle } from "lucide-react"

export default function FlowsPage() {
  const { flows, loading } = useFlows()

  const addedFlows = flows.filter((f) => f.state === "added")
  const pendingFlows = flows.filter((f) => f.state === "pending")

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Flow Rules</h1>
              <p className="text-gray-400">
                Create and manage OpenFlow rules for your network
              </p>
            </div>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              New Flow
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {flows.length}
                  </div>
                  <p className="text-xs text-gray-400">Total Flows</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">
                    {addedFlows.length}
                  </div>
                  <p className="text-xs text-gray-400">Active</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">
                    {pendingFlows.length}
                  </div>
                  <p className="text-xs text-gray-400">Pending</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Flows Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading flows...</p>
          </div>
        ) : flows.length === 0 ? (
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="py-12 text-center">
              <PlayCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No flows configured</p>
              <p className="text-gray-500 text-sm mt-1">
                Create a new flow rule to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Flow ID
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Device
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Priority
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        App
                      </th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {flows.map((flow) => (
                      <tr
                        key={flow.id}
                        className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-xs text-cyan-400">
                          {flow.flowId}
                        </td>
                        <td className="py-3 px-4 text-gray-300 font-mono text-xs">
                          {flow.deviceId}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {flow.priority}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              flow.state === "added"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-400"
                                : flow.state === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-400"
                                  : "bg-red-500/20 text-red-400 border-red-400"
                            }
                          >
                            {flow.state}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-xs">
                          {flow.appId}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-cyan-400 p-1"
                              title="Duplicate flow"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-red-400 p-1"
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
      </main>
    </div>
  )
}
