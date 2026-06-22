"use client"

import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardHeader } from "./dashboard-header"

interface DashboardLayoutProps {
  children: React.ReactNode
}

/**
 * Complete dashboard layout component that combines sidebar and header.
 * Use this in your dashboard pages for a consistent layout.
 *
 * @example
 * ```tsx
 * import { DashboardLayout } from "@/components/admin"
 *
 * export default function DashboardPage() {
 *   return (
 *     <DashboardLayout>
 *       <h1>Welcome to Dashboard</h1>
 *     </DashboardLayout>
 *   )
 * }
 * ```
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
