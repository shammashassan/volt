import { Skeleton } from "@/components/ui/skeleton"

export default function CategoriesLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 animate-pulse">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 shrink-0" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-52 md:h-10" />
              </div>
            </div>
            <Skeleton className="h-5 w-80 max-w-full mt-2" />
          </div>
          <Skeleton className="h-10 w-full sm:w-36 shrink-0" />
        </div>
      </section>

      {/* Main Content section */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          {/* Tabs skeleton */}
          <div className="flex gap-2 mb-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>

          <div className="w-full flex flex-col gap-4">
            {/* Table Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Skeleton className="h-9 w-full sm:w-[240px] lg:w-[300px]" />
              <Skeleton className="h-9 w-20 shrink-0 self-end sm:self-auto" />
            </div>

            {/* Table Card Container */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
              <div className="h-10 border-b border-border/40 bg-muted/40 flex items-center px-4 justify-between gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-32 hidden md:block" />
                <Skeleton className="h-4 w-8" />
              </div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 border-b border-border/40 last:border-0 flex items-center px-4 gap-4"
                >
                  <div className="flex items-center gap-2 w-1/4 min-w-[160px]">
                    <Skeleton className="size-8 shrink-0" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-1/3 hidden md:block" />
                  <Skeleton className="size-8 ml-auto shrink-0" />
                </div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between px-2 pt-1">
              <Skeleton className="h-4 w-36" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="size-8" />
                <Skeleton className="size-8" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
