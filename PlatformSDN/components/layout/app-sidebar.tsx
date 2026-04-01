"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Activity,
  AlertCircle,
  BarChart3,
  ChevronDown,
  Cog,
  Layers,
  Network,
  Wifi,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavItem {
  icon: React.ReactNode
  label: string
  href?: string
  items?: NavItem[]
  badge?: React.ReactNode
}

const navigationItems: NavItem[] = [
  {
    icon: <BarChart3 className="h-5 w-5" />,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: <Network className="h-5 w-5" />,
    label: "Network",
    items: [
      { icon: <Layers className="h-4 w-4" />, label: "Topology", href: "/topology" },
      { icon: <Activity className="h-4 w-4" />, label: "Devices", href: "/devices" },
      { icon: <AlertCircle className="h-4 w-4" />, label: "Alerts", href: "/alerts" },
    ],
  },
  {
    icon: <Wifi className="h-5 w-5" />,
    label: "Services",
    items: [
      { icon: <Activity className="h-4 w-4" />, label: "Flows", href: "/flows" },
      { icon: <Network className="h-4 w-4" />, label: "VPLS", href: "/services" },
    ],
  },
  {
    icon: <Cog className="h-5 w-5" />,
    label: "Configuration",
    href: "/configuration",
  },
]

const adminItems: NavItem[] = [
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    label: "Users",
    href: "/admin/users",
  },
]

function isRouteActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`))
}

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = item.href ? isRouteActive(pathname, item.href) : false
  const hasChildren = item.items && item.items.length > 0

  useEffect(() => {
    if (hasChildren) {
      const isChildActive = item.items?.some((child) => child.href && isRouteActive(pathname, child.href))
      setIsOpen(isChildActive || false)
    }
  }, [pathname, hasChildren, item.items])

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar/80 hover:text-primary",
          depth > 0 && "ml-4"
        )}
      >
        {item.icon}
        <span className="flex-1">{item.label}</span>
        {item.badge}
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isOpen
            ? "bg-sidebar/80 text-primary"
            : "text-sidebar-foreground hover:bg-sidebar/80 hover:text-primary"
        )}
      >
        {item.icon}
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && hasChildren && (
        <div className="space-y-1 border-l border-sidebar-border py-2 pl-2">
          {item.items?.map((child, index) => (
            <NavItemComponent key={index} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 left-4 z-40 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-64px)] w-64 overflow-y-auto border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="space-y-1 p-4">
          {navigationItems.map((item, index) => (
            <NavItemComponent key={index} item={item} />
          ))}

          {user?.role === "admin" && (
            <div className="mt-4 border-t border-sidebar-border pt-4">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Administration
              </p>
              <div className="mt-3 space-y-1">
                {adminItems.map((item, index) => (
                  <NavItemComponent key={index} item={item} />
                ))}
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
