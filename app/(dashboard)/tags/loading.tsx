import { Skeleton } from "@/components/ui/skeleton"

export default function TagsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 animate-pulse">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-40 md:h-10" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>
            <Skeleton className="h-5 w-96 max-w-full mt-2" />
          </div>
        </div>
      </section>

      {/* Controls & Combobox Filter Row Skeleton */}
      <section className="px-4 lg:px-6">
        <div className="p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 md:flex-row md:items-center max-w-7xl">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </section>

      {/* Tag Cloud & Categorized Grid Skeleton */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl space-y-8">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/40 bg-card/30 p-5 space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
