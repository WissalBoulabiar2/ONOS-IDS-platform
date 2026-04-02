"use client"

import { Device } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Wifi,
  AlertCircle,
  Check,
  X,
} from "lucide-react"

interface DeviceCardProps {
  device: Device
}

export function DeviceCard({ device }: DeviceCardProps) {
  const statusColor =
    device.status === "active"
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-400"
      : "bg-red-500/20 text-red-400 border-red-400"

  const statusIcon =
    device.status === "active" ? (
      <Check className="h-4 w-4" />
    ) : (
      <X className="h-4 w-4" />
    )

  return (
    <Card className="bg-gray-900 border-gray-700 hover:border-cyan-600 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Wifi className="h-5 w-5 text-cyan-400" />
              {device.name}
            </CardTitle>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              {device.id}
            </p>
          </div>
          <Badge className={`flex items-center gap-1 ${statusColor}`}>
            {statusIcon}
            {device.status === "active" ? "Online" : "Offline"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs uppercase">Type</p>
            <p className="text-white font-medium capitalize">{device.type}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase">Ports</p>
            <p className="text-white font-medium flex items-center gap-1">
              <Activity className="h-4 w-4 text-cyan-400" />
              {device.port_count || "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase">Manufacturer</p>
            <p className="text-white font-medium text-xs">
              {device.manufacturer || "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase">HW Version</p>
            <p className="text-white font-medium text-xs">
              {device.hwVersion || "—"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400 text-xs uppercase">SW Version</p>
            <p className="text-white font-medium text-xs">
              {device.swVersion || "—"}
            </p>
          </div>
        </div>

        {device.status === "inactive" && (
          <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-300 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Device is offline</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
