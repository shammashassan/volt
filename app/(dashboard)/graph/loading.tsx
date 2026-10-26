import { Skeleton } from "@/components/ui/skeleton"
import { Network } from "lucide-react"

export default function GraphLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 h-full overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Network className="size-6 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-52 md:h-10" />
              </div>
            </div>
            <Skeleton className="h-6 w-96 max-w-full mt-2" />
          </div>
        </div>
      </section>

      {/* Main content skeleton mirroring the actual top-bar filter Graph layout */}
      <section className="px-4 lg:px-6 flex flex-col gap-4 flex-1 h-[calc(100vh-var(--header-height)-10rem)] overflow-hidden">
        <div className="p-3 border border-border/40 bg-card/30 backdrop-blur-xs rounded-2xl flex flex-col gap-3 md:flex-row md:items-center">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="size-7 rounded-md animate-pulse" />
            ))}
          </div>
        </div>

        <div className="w-full flex-1 rounded-2xl border border-border/40 bg-card/20 backdrop-blur-xs relative overflow-hidden flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="size-16 rounded-full" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
        </div>
      </section>
    </div>
  )
}
