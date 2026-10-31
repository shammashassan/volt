import { Skeleton } from "@/components/ui/skeleton"

export default function PeopleLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl overflow-hidden shrink-0">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-9 w-full sm:w-32" />
        </div>
      </section>

      {/* Main Content section */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          {/* Tabs row and search bar skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Tabs pill skeleton */}
            <Skeleton className="h-9 w-96 hidden md:block" />

            {/* Search and sort skeleton */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Skeleton className="h-9 w-full sm:w-64" />
              <Skeleton className="size-9 shrink-0" />
            </div>
          </div>

          {/* Single view: Avatar with name label skeleton */}
          <div className="flex flex-wrap items-start gap-8 pt-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center w-32 pt-2 pb-2 gap-2"
              >
                {/* 64px circular avatar skeleton */}
                <div className="size-16 rounded-full overflow-hidden shrink-0">
                  <Skeleton className="h-full w-full" />
                </div>
                {/* Name label skeleton */}
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
