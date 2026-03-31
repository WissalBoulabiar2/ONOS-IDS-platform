"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Info, AlertTriangle, Clock } from "lucide-react"

export interface TimelineEvent {
  id: string
  title: string
  description: string
  timestamp: Date
  type: "error" | "success" | "info" | "warning"
  device?: string
}

interface TimelineEventsProps {
  events: TimelineEvent[]
  title?: string
  limit?: number
}

export function TimelineEvents({
  events,
  title = "Recent Events",
  limit = 5,
}: TimelineEventsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-50 dark:bg-red-950 border-l-4 border-red-600 dark:border-red-400"
      case "success":
        return "bg-emerald-50 dark:bg-emerald-950 border-l-4 border-emerald-600 dark:border-emerald-400"
      case "warning":
        return "bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-600 dark:border-amber-400"
      case "info":
      default:
        return "bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-600 dark:border-blue-400"
    }
  }

  const sortedEvents = [...events]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No events yet</p>
            </div>
          ) : (
            sortedEvents.map((event, idx) => (
              <div key={event.id} className={`p-4 rounded-lg ${getTypeColor(event.type)}`}>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 pt-1">
                    {getIcon(event.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {event.description}
                        </p>
                        {event.device && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                            Device: <span className="font-mono">{event.device}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-2">
                      <Clock className="h-3 w-3" />
                      {formatEventTimestamp(event.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function formatEventTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(date))
}
