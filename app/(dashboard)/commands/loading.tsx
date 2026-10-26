import { Skeleton } from "@/components/ui/skeleton"

export default function CommandsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 animate-pulse">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-44 md:h-10" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-5 w-80 max-w-full mt-2" />
          </div>
        </div>
      </section>

      {/* Filter and grid section */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-border/40 rounded-xl p-5 bg-card/30 backdrop-blur-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32 rounded" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-9 w-full rounded-md mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
