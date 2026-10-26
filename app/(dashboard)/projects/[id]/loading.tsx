import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectDetailLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 animate-pulse">
      {/* Header section skeleton */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 max-w-7xl">
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

      {/* Content tabs & lists skeleton */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl space-y-6">
          <div className="flex gap-4 border-b border-border/20 pb-2">
            <Skeleton className="h-6 w-24 bg-muted/30" />
            <Skeleton className="h-6 w-20 bg-muted/30" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl bg-muted/30" />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
