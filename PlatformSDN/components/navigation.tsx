"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { LogOut, Menu, Server, ShieldCheck, Wifi, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"

const baseNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/devices", label: "Devices" },
  { href: "/topology", label: "Topology" },
  { href: "/flows", label: "Flows" },
  { href: "/alerts", label: "Alerts" },
  { href: "/services", label: "Services" },
  { href: "/configuration", label: "Configuration" },
]

function isRouteActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`))
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const navItems = useMemo(
    () =>
      user?.role === "admin"
        ? [...baseNavItems, { href: "/admin/users", label: "Users" }]
        : baseNavItems,
    [user?.role]
  )

  const activeItem = navItems.find((item) => isRouteActive(pathname, item.href))

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const getNavClassName = (href: string) =>
    cn(
      "shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors",
      isRouteActive(pathname, href)
        ? "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300"
        : "text-gray-700 hover:bg-slate-100 hover:text-cyan-700 dark:text-gray-300 dark:hover:bg-slate-900 dark:hover:text-cyan-300"
    )

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center gap-3 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link href={isAuthenticated ? "/dashboard" : "/login"} className="flex shrink-0 items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/15 dark:text-cyan-300">
                <Wifi className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                  PlatformSDN
                </p>
                <p className="hidden text-[11px] uppercase tracking-[0.24em] text-slate-500 sm:block dark:text-slate-400">
                  Operations Center
                </p>
              </div>
            </Link>

            <div className="hidden min-w-0 items-center gap-3 border-l border-slate-300 pl-4 text-xs text-slate-600 lg:flex dark:border-slate-700 dark:text-slate-500">
              <div className="flex shrink-0 items-center gap-1.5">
                <Server className="h-3.5 w-3.5" />
                <span>ONOS Controller</span>
              </div>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span className="truncate">{isAuthenticated ? "Secured Session" : "Login Required"}</span>
            </div>
          </div>

          {isAuthenticated && (
            <div className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
              <div className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-full border border-slate-200 bg-slate-50/90 px-2 py-1 dark:border-slate-800 dark:bg-slate-900/80">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className={getNavClassName(item.href)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex shrink-0 items-center justify-end gap-2">
            <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:block dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
              {isAuthenticated ? "Authenticated" : "Public"}
            </div>

            {activeItem && (
              <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 lg:block xl:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {activeItem.label}
              </div>
            )}

            <ThemeToggle />

            <div className="hidden items-center gap-3 xl:flex">
              {isLoading ? (
                <div className="text-xs text-slate-500 dark:text-slate-400">Session...</div>
              ) : isAuthenticated && user ? (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.fullName}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      {user.role}
                    </p>
                  </div>
                  <Button className="bg-cyan-600 text-white hover:bg-cyan-700" size="sm" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Operator Login
                  </Button>
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition-colors hover:text-cyan-600 xl:hidden dark:border-slate-800 dark:text-slate-300 dark:hover:text-cyan-300"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isAuthenticated && (
          <div className="hidden border-t border-slate-200 py-3 md:block xl:hidden dark:border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={getNavClassName(item.href)}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 xl:hidden">
          <div className="mx-auto max-w-7xl space-y-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              {isAuthenticated && user ? (
                <>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.fullName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {user.role}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">Authentication required</p>
              )}
            </div>

            {isAuthenticated && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm font-medium transition-colors",
                      isRouteActive(pathname, item.href)
                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
              {isAuthenticated ? (
                <Button className="w-full bg-cyan-600 text-white hover:bg-cyan-700" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Operator Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
