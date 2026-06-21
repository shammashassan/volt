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
    </div>
  );
}
