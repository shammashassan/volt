import { Skeleton } from "@/components/ui/skeleton"

export default function PersonDetailLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 animate-pulse">
      {/* Header section skeleton */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 max-w-7xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl bg-muted/30" />
              <Skeleton className="h-12 w-12 rounded-xl bg-muted/30" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-48 bg-muted/30 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-full bg-muted/30" />
              </div>
            </div>
            <div className="space-y-2 mt-2 max-w-2xl">
              <Skeleton className="h-5 w-full bg-muted/30 rounded-md" />
              <Skeleton className="h-5 w-3/4 bg-muted/30 rounded-md" />
            </div>
          </div>
        </div>
      </section>

      {/* Content grids */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-36 bg-muted/30 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl bg-muted/30" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
