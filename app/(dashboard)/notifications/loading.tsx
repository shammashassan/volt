import { Skeleton } from "@/components/ui/skeleton"

export default function NotificationsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 animate-pulse w-full min-w-0">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-48 md:h-10" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-80 max-w-full mt-2" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="size-8" />
          </div>
        </div>
      </section>

      {/* Controls Bar skeleton */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Skeleton className="h-8 w-64" />
          <div className="flex items-center gap-2 flex-1 sm:max-w-md ml-auto">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-[130px] shrink-0" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl space-y-4">
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl border border-border/40 gap-4"
            >
              <div className="flex items-center gap-3.5 flex-1">
                <Skeleton className="size-10 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="size-8" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
