"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Palette,
  Settings,
  Plug,
  BarChart3
} from "lucide-react"
import { useTranslations } from "@/lib/i18n/useTranslations"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { t } = useTranslations()

  const navigationItems = [
    {
      name: t('nav.dashboard'),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: t('nav.events'),
      href: "/events",
      icon: Calendar,
    },
    {
      name: t('nav.analytics'),
      href: "/analytics",
      icon: BarChart3,
    },
    {
      name: t('nav.design'),
      href: "/design",
      icon: Palette,
    },
    {
      name: t('nav.integrations'),
      href: "/integrations",
      icon: Plug,
    },
    {
      name: t('nav.settings'),
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">BookingSaaS</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
