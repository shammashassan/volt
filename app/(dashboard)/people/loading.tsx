import { Skeleton } from "@/components/ui/skeleton"

export default function PeopleLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 animate-pulse">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-32 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-5 w-[80%] max-w-md mt-2" />
          </div>
          <Skeleton className="h-10 w-full sm:w-32 rounded-md shrink-0" />
        </div>
      </section>

      {/* Main Content section */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          <div className="max-w-md w-full">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/20 p-5 bg-card/30 backdrop-blur-xs flex flex-col justify-between h-[180px]"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full" />
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-28 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full rounded mt-1" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>
                <div className="flex items-center justify-between border-t border-border/10 pt-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
