import { Skeleton } from "@/components/ui/skeleton"

export default function PersonDetailLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 animate-pulse">
      {/* Header section skeleton */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 max-w-7xl">
          <div className="flex flex-col gap-3">
            {/* Back button */}
            <Skeleton className="-ml-2 h-8 w-28" />
            <div className="flex items-center gap-3">
              {/* Icon skeleton */}
              <Skeleton className="h-12 w-12" />
              {/* Name & Badge skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            {/* Notes/description skeleton */}
            <div className="space-y-2 mt-2 max-w-2xl">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content (Tabs) skeleton */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          {/* Tabs header */}
          <div className="flex gap-2 max-w-[320px]">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-10 w-1/2" />
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-border/40 bg-card/30 rounded-xl p-5 flex flex-col gap-3 h-44">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="mt-auto pt-3 border-t border-border/20 flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
