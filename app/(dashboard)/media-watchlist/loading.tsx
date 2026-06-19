import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WatchlistLoading() {
  return (
    <div className="flex-1 space-y-6 p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
      {/* Header Block Loader */}
      <div className="flex items-center justify-between border-b pb-4 animate-pulse">
        <div className="space-y-1">
          <div className="h-7 w-48 bg-muted rounded-md" />
          <div className="h-4.5 w-64 bg-muted rounded-sm" />
        </div>
        <div className="h-8 w-24 bg-muted rounded-md" />
      </div>

      {/* Filters Loader */}
      <div className="flex flex-col gap-4 border-b pb-4 mb-6">
        <div className="space-y-1.5">
          <div className="h-3 w-10 bg-muted rounded" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-7 w-16 bg-muted rounded-full" />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-10 bg-muted rounded" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-7 w-16 bg-muted rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Grid Loader */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {Array.from({ length: 16 }).map((_, idx) => (
          <div key={idx} className="border bg-card rounded-lg overflow-hidden flex flex-col gap-2 p-0 h-full">
            <Skeleton className="aspect-[2/3] w-full rounded-none" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-3.5 w-3/4 rounded" />
              <div className="flex gap-1.5 pt-0.5">
                <Skeleton className="h-7 flex-1 rounded" />
                <Skeleton className="h-7 w-10 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
