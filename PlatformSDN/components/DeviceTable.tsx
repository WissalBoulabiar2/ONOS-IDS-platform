"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, ChevronRight, Power } from "lucide-react"

interface Device {
  id: string
  type: string
  available: boolean
  manufacturer?: string
  serialNumber?: string
}

interface DeviceTableProps {
  devices: Device[]
  isLoading?: boolean
  onSelectDevice: (device: Device) => void
  onActionClick?: (action: string, device: Device) => void
}

export function DeviceTable({
  devices,
  isLoading = false,
  onSelectDevice,
  onActionClick,
}: DeviceTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "online" | "offline">("all")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")

  // Filter devices
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "online" && device.available) ||
      (statusFilter === "offline" && !device.available)

    const matchesType = typeFilter === "all" || device.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const types = Array.from(new Set(devices.map((d) => d.type)))

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search devices by ID or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredDevices.length} of {devices.length} devices
      </p>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">
                Device ID
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">
                Type
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">
                Status
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">
                Manufacturer
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">
                Serial Number
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Loading devices...
                </td>
              </tr>
            ) : filteredDevices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No devices found
                </td>
              </tr>
            ) : (
              filteredDevices.map((device) => (
                <tr
                  key={device.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                    {device.id}
                  </td>

                  <td className="px-6 py-4">
                    <Badge variant="outline">{device.type}</Badge>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          device.available ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {device.available ? "Online" : "Offline"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {device.manufacturer || "-"}
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                    {device.serialNumber || "N/A"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectDevice(device)}
                        className="text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950"
                      >
                        <ChevronRight className="h-4 w-4" />
                        Details
                      </Button>

                      {device.available && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onActionClick?.("disable", device)}
                          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
