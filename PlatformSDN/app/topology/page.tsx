"use client"

import React from "react"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TopologyMap } from "@/components/TopologyMap"
import { useTopology, useRealtimeUpdates } from "@/hooks/sdn-hooks"
import { Activity, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TopologyPage() {
  const { nodes, edges, loading } = useTopology()
  const timestamp = useRealtimeUpdates(5000)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Network Topology</h1>
          <p className="text-gray-400 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Interactive network visualization • Last updated:{" "}
            {timestamp.toLocaleTimeString()}
          </p>
        </div>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Network Map</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="w-full h-full bg-gray-950 rounded flex items-center justify-center py-32">
                <p className="text-gray-400">Loading topology...</p>
              </div>
            ) : (
              <TopologyMap nodes={nodes} edges={edges} />
            )}
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-400">
          <p>
            <strong>💡 Tip:</strong> Click on any device to view detailed information.
            The color coding shows:
          </p>
          <ul className="mt-2 ml-4 space-y-1 text-xs">
            <li>🔵 <span className="text-cyan-400">Blue Square</span> = Switch</li>
            <li>🔷 <span className="text-cyan-300">Cyan Diamond</span> = Router</li>
            <li>🔵 <span className="text-teal-400">Teal Circle</span> = Host</li>
            <li>⚫ <span className="text-gray-400">Gray</span> = Inactive Device</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
