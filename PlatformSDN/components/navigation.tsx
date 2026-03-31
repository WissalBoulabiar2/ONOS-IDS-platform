"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useState } from "react"
import { Menu, X, Wifi, LogOut } from "lucide-react"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <Wifi className="h-6 w-6 text-cyan-400" />
                <span className="text-2xl font-bold text-cyan-400">SDN</span>
              </Link>
            </div>
            <div className="hidden md:block text-xs text-gray-600 dark:text-gray-500 ml-4 pl-4 border-l border-gray-300 dark:border-gray-700">
              ONOS Controller
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/devices"
              className="text-gray-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Devices
            </Link>
            <Link
              href="/topology"
              className="text-gray-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Topology
            </Link>
            <Link
              href="/flows"
              className="text-gray-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Flows
            </Link>
            <Link
              href="/alerts"
              className="text-gray-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Alerts
            </Link>
            <Link
              href="/configuration"
              className="text-gray-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Config
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Login
              </Button>
            </Link>
            <Button
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-cyan-400 p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/devices"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Devices
              </Link>
              <Link
                href="/topology"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Topology
              </Link>
              <Link
                href="/flows"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Flows
              </Link>
              <Link
                href="/alerts"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Alerts
              </Link>
              <Link
                href="/configuration"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Config
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2 flex items-center gap-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 mb-2"
                  >
                    Login
                  </Button>
                </Link>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
