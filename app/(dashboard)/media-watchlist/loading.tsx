import { Skeleton } from "@/components/ui/skeleton";

export default function WatchlistLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              {/* Icon box placeholder */}
              <Skeleton className="h-12 w-12" />
              {/* Title & Badge */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
            {/* Description text placeholder */}
            <Skeleton className="h-5 w-72 mt-1" />
          </div>
          {/* Add Media Button placeholder */}
          <Skeleton className="h-10 w-full sm:w-28" />
        </div>
      </section>

      {/* Filter Toolbar */}
      <section className="px-4 lg:px-6">
        <div className="p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 lg:flex-row lg:items-center max-w-7xl">
          {/* Search Input Placeholder */}
          <Skeleton className="h-10 flex-1 w-full" />
          {/* Filter buttons/selectors */}
          <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
            {/* Status Select */}
            <Skeleton className="h-10 w-[140px]" />
            {/* Type Select */}
            <Skeleton className="h-10 w-[140px]" />
            {/* Rated Toggle */}
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </section>

      {/* Results / List State */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {Array.from({ length: 16 }).map((_, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden aspect-2/3 w-full border bg-card rounded-xl"
              >
                {/* Poster Image Skeleton */}
                <Skeleton className="h-full w-full" />

                {/* Bottom Badges */}
                {/* Status icon badge */}
                <Skeleton className="absolute bottom-2 left-2 h-7 w-7" />

                {/* Rating value badge (rendered on ~66% of cards for realism) */}
                {idx % 3 !== 0 && (
                  <Skeleton className="absolute bottom-2 right-2 h-7 w-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
