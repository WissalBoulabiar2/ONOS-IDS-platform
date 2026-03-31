"use client"

import type React from "react"

import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity, ArrowRight, Eye, EyeOff, Lock, Server, Shield } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login attempt:", { email, password, rememberMe })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navigation />

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4 py-12 dark:from-gray-900 dark:to-gray-950 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
              <Shield className="h-8 w-8 text-cyan-600" />
            </div>
            <h2 className="text-3xl font-serif font-black text-gray-900 dark:text-white">SDN Control Access</h2>
            <p className="mt-2 font-sans text-gray-600 dark:text-gray-400">
              Sign in to supervise topology, devices, flows, and network alerts.
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="text-2xl font-serif font-bold">Operator Login</CardTitle>
              <CardDescription className="font-sans">
                Authenticate to access the centralized SDN dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email or username
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="admin@sdn.local"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 pr-10 text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember-me" className="text-sm text-gray-600 dark:text-gray-400">
                      Keep session active
                    </Label>
                  </div>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-lg bg-cyan-600 px-4 py-3 text-sm font-medium text-white hover:bg-cyan-700"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">Need a new account?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/register">
                    <Button
                      variant="outline"
                      className="w-full border-cyan-600 bg-transparent text-cyan-600 hover:bg-cyan-50"
                    >
                      Create Operator Account
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white/80 p-3 dark:border-gray-800 dark:bg-gray-900/80">
              <div className="mb-2 flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <Server className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Controller</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">ONOS local instance</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white/80 p-3 dark:border-gray-800 dark:bg-gray-900/80">
              <div className="mb-2 flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Mode</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Network supervision</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white/80 p-3 dark:border-gray-800 dark:bg-gray-900/80">
              <div className="mb-2 flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <Lock className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Access</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Admin and operator roles</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs font-sans text-gray-500 dark:text-gray-400">
              <strong>Test Account:</strong>
              <br />
              Email: admin@sdn.local | Password: admin123
            </p>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 py-16 text-white dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-2xl font-serif font-black text-cyan-400">SDN Platform</h3>
              <p className="mb-4 font-sans text-gray-400">
                Centralized supervision and configuration platform for software-defined networks based on ONOS.
              </p>
              <div className="text-sm font-sans text-gray-400">
                <p>Open Network Operating System (ONOS)</p>
                <p>Version: 2.8.1</p>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-serif font-bold">Platform</h4>
              <ul className="space-y-2 font-sans text-gray-400">
                <li><Link href="/" className="transition-colors hover:text-cyan-400">Dashboard</Link></li>
                <li><Link href="/topology" className="transition-colors hover:text-cyan-400">Topology</Link></li>
                <li><Link href="/devices" className="transition-colors hover:text-cyan-400">Devices</Link></li>
                <li><Link href="/flows" className="transition-colors hover:text-cyan-400">Flow Rules</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-serif font-bold">Monitoring</h4>
              <ul className="space-y-2 font-sans text-gray-400">
                <li><Link href="/alerts" className="transition-colors hover:text-cyan-400">Active Alerts</Link></li>
                <li><Link href="/configuration" className="transition-colors hover:text-cyan-400">Controller Settings</Link></li>
                <li><Link href="/login" className="transition-colors hover:text-cyan-400">Access Control</Link></li>
                <li><Link href="/forgot-password" className="transition-colors hover:text-cyan-400">Password Recovery</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-serif font-bold">Environment</h4>
              <div className="space-y-2 font-sans text-gray-400">
                <p>Frontend: Next.js control center</p>
                <p>Backend: ONOS proxy API</p>
                <p>Mode: Local development lab</p>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 text-center">
            <p className="font-sans text-gray-400">
              © 2024 SDN Platform. Centralized SDN supervision interface built for ONOS-based environments.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
