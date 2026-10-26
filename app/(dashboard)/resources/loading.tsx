import { Skeleton } from "@/components/ui/skeleton"

export default function ResourcesLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 animate-pulse">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-48 md:h-10" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-5 w-96 max-w-full mt-2" />
          </div>
          <Skeleton className="h-10 w-full sm:w-32 shrink-0" />
        </div>
      </section>

      {/* Filter and search bar */}
      <section className="px-4 lg:px-6">
        <div className="p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 lg:flex-row lg:items-center max-w-7xl">
          <div className="relative flex-1">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Skeleton className="h-10 w-[130px] rounded-md" />
            <Skeleton className="h-10 w-[130px] rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </section>

      {/* Resource cards grid */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border border-border/40 rounded-2xl p-6 flex flex-col gap-4 bg-card/30 backdrop-blur-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                </div>
                <Skeleton className="size-8 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-full rounded mt-1" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <div className="flex items-center justify-between border-t border-border/20 pt-4 mt-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
