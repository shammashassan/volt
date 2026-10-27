import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { NotificationsProvider } from "@/components/notifications/notifications-provider"
import { requireAuth } from "@/lib/auth-utils"
import { getCategories } from "@/lib/queries/categories"
import { getCollections } from "@/lib/queries/collections"
import { NuqsAdapter } from "nuqs/adapters/next/app"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()
  const [categories, collections] = await Promise.all([
    getCategories(session.user.id),
    getCollections(session.user.id),
  ])

  return (
    <NuqsAdapter>
      <NotificationsProvider>
        <div className="[--header-height:calc(--spacing(14))] flex min-h-screen w-full">
          <SidebarProvider className="flex flex-col">
            <SiteHeader initialCategories={categories} />
            <div className="flex flex-1">
              <AppSidebar
                variant="inset"
                collapsible="icon"
                initialCategories={categories}
                initialCollections={collections}
              />
              <SidebarInset className="bg-background overflow-hidden">
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
