import { Suspense } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { QuickCaptureProvider } from "@/components/quick-capture-drawers"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="[--header-height:calc(--spacing(14))] flex min-h-screen w-full">
      <QuickCaptureProvider>
        <SidebarProvider className="flex flex-col">
          <Suspense fallback={
            <header className="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md transition-all ease-linear w-full px-4 lg:px-6" />
          }>
            <SiteHeader />
          </Suspense>
          <div className="flex flex-1">
            <Suspense fallback={
              <div className="w-64 border-r bg-sidebar h-screen hidden md:block" />
            }>
              <AppSidebar variant="inset" collapsible="icon" />
            </Suspense>
            <SidebarInset className="bg-background overflow-hidden">
              <div className="flex flex-1 flex-col pt-0">
                <Suspense fallback={
                  <div className="flex-1 space-y-6 p-8 animate-pulse">
                    <div className="h-8 w-1/3 bg-muted rounded-lg" />
                    <div className="h-4 w-2/3 bg-muted rounded-md" />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-40 bg-muted rounded-xl" />
                      ))}
                    </div>
                  </div>
                }>
                  {children}
                </Suspense>
              </div>
            </SidebarInset>
          </div>
          <SiteFooter />
        </SidebarProvider>
      </QuickCaptureProvider>
    </div>
  )
}