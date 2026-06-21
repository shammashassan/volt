import React from "react";
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
              <Skeleton className="h-12 w-12 rounded-xl bg-muted/65" />
              {/* Title & Badge */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-44 bg-muted/65 rounded-md" />
                <Skeleton className="h-6 w-16 bg-muted/65 rounded-full" />
              </div>
            </div>
            {/* Description text placeholder */}
            <Skeleton className="h-5 w-72 bg-muted/65 rounded-md mt-1" />
          </div>
          {/* Add Media Button placeholder */}
          <Skeleton className="h-10 w-full sm:w-28 bg-muted/65 rounded-md shrink-0" />
        </div>
      </section>

      {/* Filter Toolbar */}
      <section className="px-4 lg:px-6">
        <div className="p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 lg:flex-row lg:items-center max-w-7xl">
          {/* Search Input Placeholder */}
          <Skeleton className="h-10 bg-muted/65 rounded-md flex-1 w-full" />
          {/* Filter buttons/selectors */}
          <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
            {/* Status Select */}
            <Skeleton className="h-10 w-[140px] bg-muted/65 rounded-md" />
            {/* Type Select */}
            <Skeleton className="h-10 w-[140px] bg-muted/65 rounded-md" />
            {/* Rated Toggle */}
            <Skeleton className="h-10 w-20 bg-muted/65 rounded-md" />
          </div>
        </div>
      </section>
    </div>
  );
}
