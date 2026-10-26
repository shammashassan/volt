import { Skeleton } from "@/components/ui/skeleton"

export default function RemindersLoading() {
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
            <Skeleton className="h-5 w-80 max-w-full mt-2" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
          <div>
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
        </div>
      </section>
    </div>
  )
}
