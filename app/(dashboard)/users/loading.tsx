import { Skeleton } from "@/components/ui/skeleton"

export default function UsersLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 animate-pulse">
      {/* Header section skeleton */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 shrink-0" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-48 md:h-10" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-80 max-w-full mt-2" />
          </div>
          <Skeleton className="h-10 w-32 shrink-0" />
        </div>
      </section>

      {/* Main Content section skeleton */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          {/* Tabs skeleton */}
          <div className="flex gap-2 mb-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>

          {/* Table skeleton */}
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-xs">
            <div className="h-10 border-b border-border/50 bg-muted/30 px-4 flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border/40 last:border-0 px-4 py-3 gap-4"
              >
                <div className="w-[280px] shrink-0 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-5 w-14" />
                </div>
                <div className="w-16 flex justify-end">
                  <Skeleton className="size-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
