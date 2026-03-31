"use client"

import React from "react"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, Save, RotateCcw } from "lucide-react"

export default function ConfigurationPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
            <Settings className="h-8 w-8 text-cyan-400" />
            Configuration
          </h1>
          <p className="text-gray-400">Manage SDN platform settings</p>
        </div>

        {/* ONOS Connection */}
        <Card className="bg-gray-900 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">ONOS Controller</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300 mb-2 block">Controller URL</Label>
              <Input
                defaultValue="http://localhost:8181"
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                REST API endpoint of your ONOS instance
              </p>
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Username</Label>
              <Input
                type="text"
                defaultValue="onos"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Password</Label>
              <Input
                type="password"
                defaultValue="rocks"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card className="bg-gray-900 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Data Collection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Enable Metrics Collection</p>
                <p className="text-gray-400 text-sm">
                  Collect bandwidth, latency, and packet stats
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">
                Collection Interval (seconds)
              </Label>
              <Input
                type="number"
                defaultValue="30"
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                How often to poll ONOS for updates
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alerting */}
        <Card className="bg-gray-900 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Alert Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Enable Alerts</p>
                <p className="text-gray-400 text-sm">Receive notifications for network issues</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">
                High Usage Threshold (%)
              </Label>
              <Input
                type="number"
                defaultValue="90"
                max="100"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-950/30 border-red-900/50 mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-red-400">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Reset to Defaults</p>
                <p className="text-gray-400 text-sm">
                  Restore all settings to their default values
                </p>
              </div>
              <Button
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-950"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Actions */}
        <div className="flex gap-3">
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" className="border-gray-600 text-gray-300">
            Cancel
          </Button>
        </div>
      </main>
    </div>
  )
}
