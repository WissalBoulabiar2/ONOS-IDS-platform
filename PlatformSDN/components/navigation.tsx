"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LogOut, Menu, Server, ShieldCheck, Wifi, X } from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/devices", label: "Devices" },
  { href: "/topology", label: "Topology" },
  { href: "/flows", label: "Flows" },
  { href: "/alerts", label: "Alerts" },
  { href: "/configuration", label: "Configuration" },
]

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const getNavClassName = (href: string) => {
    const isActive = pathname === href

    return isActive
      ? "px-3 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400"
      : "px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Wifi className="h-6 w-6 text-cyan-400" />
            <span className="text-2xl font-bold text-cyan-400">SDN</span>
          </Link>
          <div className="hidden items-center gap-3 border-l border-gray-300 pl-4 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-500 md:flex">
            <div className="flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5" />
              <span>ONOS Controller</span>
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Local Lab</span>
          </div>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={getNavClassName(item.href)}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            Controller Connected
          </div>
          <ThemeToggle />
          <Link href="/login">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Operator Login
            </Button>
          </Link>
          <Button className="bg-cyan-600 text-white hover:bg-cyan-700" size="sm">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Admin Session
          </Button>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen((value) => !value)}
            className="p-2 text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
              ONOS controller status: connected
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname === item.href
                    ? "block px-3 py-2 text-base font-medium text-cyan-600 dark:text-cyan-400"
                    : "block px-3 py-2 text-base font-medium text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 space-y-2 border-t border-gray-200 pt-3 dark:border-gray-800">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Operator Login
                </Button>
              </Link>
              <Button className="w-full bg-cyan-600 text-white hover:bg-cyan-700">
                <LogOut className="mr-2 h-4 w-4" />
                End Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
