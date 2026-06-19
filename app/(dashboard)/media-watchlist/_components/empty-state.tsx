import React from "react";
import { Button } from "@/components/ui/button";
import { Film } from "lucide-react";

interface EmptyStateProps {
  onAddMedia: () => void;
}

export function EmptyState({ onAddMedia }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-2xl h-80 bg-card select-none">
      <Film className="h-10 w-10 text-muted-foreground/60 mb-4 stroke-[1.5]" />
      <h3 className="font-semibold text-lg">No media yet.</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
        Track movies, series, and anime in one place.
      </p>
      <Button onClick={onAddMedia} className="mt-6" size="sm">
        Add Media
      </Button>
    </div>
  );
}
