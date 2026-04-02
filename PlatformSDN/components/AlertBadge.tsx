"use client"

import { Alert } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react"

interface AlertBadgeProps {
  alert: Alert
  size?: "sm" | "md" | "lg"
}

export function AlertBadge({ alert, size = "md" }: AlertBadgeProps) {
  const getSeverityStyle = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-400"
      case "warning":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400"
      case "info":
        return "bg-blue-500/20 text-blue-400 border-blue-400"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400"
    }
  }

  const getIcon = (severity: Alert["severity"]) => {
    const iconProps = {
      sm: { h: 3, w: 3 },
      md: { h: 4, w: 4 },
      lg: { h: 5, w: 5 },
    }
    const props = iconProps[size]

    switch (severity) {
      case "critical":
        return <AlertCircle className={`h-${props.h} w-${props.w}`} />
      case "warning":
        return <AlertTriangle className={`h-${props.h} w-${props.w}`} />
      case "info":
        return <Info className={`h-${props.h} w-${props.w}`} />
      default:
        return null
    }
  }

  const sizeClass = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  }

  return (
    <Badge
      className={`flex items-center gap-1.5 border ${getSeverityStyle(alert.severity)} ${sizeClass[size]}`}
    >
      {getIcon(alert.severity)}
      <span className="flex-1 line-clamp-1">{alert.message}</span>
      {alert.resolved && (
        <CheckCircle className="h-3 w-3 flex-shrink-0 opacity-60" />
      )}
    </Badge>
  )
}

interface AlertListProps {
  alerts: Alert[]
  maxItems?: number
}

export function AlertList({ alerts, maxItems = 5 }: AlertListProps) {
  const visibleAlerts = alerts.slice(0, maxItems)
  const hiddenCount = Math.max(0, alerts.length - maxItems)

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert) => (
        <AlertBadge key={alert.id} alert={alert} size="md" />
      ))}
      {hiddenCount > 0 && (
        <p className="text-xs text-gray-400">
          +{hiddenCount} more alert{hiddenCount > 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}
