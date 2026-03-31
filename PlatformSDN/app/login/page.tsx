"use client"

import type React from "react"

import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, ArrowRight, Shield } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Login attempt:", { email, password, rememberMe })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navigation />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-900 to-white dark:to-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-cyan-600" />
            </div>
            <h2 className="text-3xl font-serif font-black text-gray-900 dark:text-white">SDN Network Control</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 font-sans">Sign in to manage your network infrastructure</p>
          </div>

          {/* Login Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-serif font-bold">Sign In</CardTitle>
              <CardDescription className="font-sans">Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 font-sans">
                    User
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500 focus:z-10 sm:text-sm font-sans dark:bg-gray-800"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 font-sans">
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
                      className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500 focus:z-10 sm:text-sm font-sans dark:bg-gray-800"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
                    <Label htmlFor="remember-me" className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                      Remember me
                    </Label>
                  </div>

                  <Link
                    href="/forgot-password"
                    className="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-sans font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 font-sans"
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
                    <span className="px-2 bg-white text-gray-500 font-sans">Don't have an account?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/register">
                    <Button
                      variant="outline"
                      className="w-full border-cyan-600 text-cyan-600 hover:bg-cyan-50 bg-transparent font-sans"
                    >
                      Create New Account
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Credentials */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">
              <strong>Test Account:</strong><br/>
              Email: admin@sdn.local | Password: admin123
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-serif font-black text-cyan-400 mb-4">SDN Platform</h3>
              <p className="text-gray-400 font-sans mb-4">
                Centralized network management based on ONOS controller. Control, monitor, and configure your Software-Defined Network infrastructure.
              </p>
              <div className="text-sm text-gray-400 font-sans">
                <p>Open Network Operating System (ONOS)</p>
                <p>Version: 2.8.1</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-serif font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400 font-sans">
                <li>
                  <Link href="/services/portfolio-management" className="hover:text-cyan-400 transition-colors">
                    Portfolio Management
                  </Link>
                </li>
                <li>
                  <Link href="/services/wealth-planning" className="hover:text-cyan-400 transition-colors">
                    Wealth Planning
                  </Link>
                </li>
                <li>
                  <Link href="/services/risk-assessment" className="hover:text-cyan-400 transition-colors">
                    Risk Assessment
                  </Link>
                </li>
                <li>
                  <Link href="/services/tax-optimization" className="hover:text-cyan-400 transition-colors">
                    Tax Optimization
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-serif font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 font-sans">
                <li>
                  <Link href="/about" className="hover:text-cyan-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/about#team" className="hover:text-cyan-400 transition-colors">
                    Our Team
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-cyan-400 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-cyan-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-serif font-bold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400 font-sans">
                <p>📧 info@pmsinvestment.com</p>
                <p>📞 +91 98765 43210</p>
                <p>📍 Mumbai, Maharashtra</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 font-sans">
              © 2024 SDN Platform. Open-source network management solution based on ONOS Controller.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
