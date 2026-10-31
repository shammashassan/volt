import { Skeleton } from "@/components/ui/skeleton"

export default function PersonDetailLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section skeleton */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 max-w-7xl">
          <div className="flex flex-col gap-3 w-full md:w-auto">
            {/* Back button */}
            <Skeleton className="-ml-2 h-8 w-28" />

            <div className="flex items-center gap-4">
              {/* Avatar skeleton matching Avatar size="xl" (size-16 / 64px) */}
              <div className="size-16 rounded-full overflow-hidden shrink-0">
                <Skeleton className="h-full w-full" />
              </div>
              {/* Name & Badge skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>

            {/* Notes/description skeleton */}
            <div className="flex flex-col gap-2 mt-2 max-w-2xl">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3" />
            </div>

            {/* Tags skeleton */}
            <div className="flex gap-1.5 mt-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          {/* Action buttons skeleton (Edit, Delete, Date) */}
          <div className="flex items-center gap-2 self-start mt-1 md:mt-0 shrink-0">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-32" />
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

          {/* Grid skeleton matching ResourceCard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="border border-border/40 bg-card/60 rounded-xl overflow-hidden flex flex-col"
              >
                {/* Image preview skeleton matching ResourceCard aspect-video */}
                <div className="aspect-video w-full overflow-hidden">
                  <Skeleton className="h-full w-full" />
                </div>
                {/* Content area */}
                <div className="p-4 flex flex-col gap-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
