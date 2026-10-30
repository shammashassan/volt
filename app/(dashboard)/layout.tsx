import { Suspense } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { NotificationsProvider } from "@/components/notifications/notifications-provider"
import { requireAuth } from "@/lib/auth-utils"
import { NuqsAdapter } from "nuqs/adapters/next/app"

async function AuthGuard() {
  await requireAuth()
  return null
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NuqsAdapter>
      <NotificationsProvider>
        <Suspense fallback={null}>
          <AuthGuard />
        </Suspense>
        <div className="[--header-height:calc(--spacing(14))] flex min-h-screen w-full">
          <SidebarProvider className="flex flex-col">
            <SiteHeader />
            <div className="flex flex-1">
              <AppSidebar variant="inset" collapsible="icon" />
              <SidebarInset className="overflow-hidden">
                <div className="flex flex-1 flex-col pt-0">
                  {children}
                </div>
              </SidebarInset>
            </div>
            <SiteFooter />
          </SidebarProvider>
        </div>
      </NotificationsProvider>
    </NuqsAdapter>
  )
}
