"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1">
        <AppSidebar variant="inset" collapsible="icon" />
        <SidebarInset className="overflow-hidden">
          <div className="flex flex-1 flex-col overflow-x-hidden">
            {children}
          </div>
        </SidebarInset>
      </div>
    </>
  )
}
