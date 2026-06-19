"use client";

import React from "react";
import { WatchlistStatus } from "../_types/watchlist.types";
import { WATCHLIST_STATUS_LABELS } from "../_constants/watchlist.constants";
import { cn } from "@/lib/utils";

interface WatchlistFiltersProps {
  currentStatus: string;
  currentType: string;
  onStatusChange: (status: string) => void;
  onTypeChange: (type: string) => void;
}

export function WatchlistFilters({
  currentStatus,
  currentType,
  onStatusChange,
  onTypeChange,
}: WatchlistFiltersProps) {
  const statuses: { value: string; label: string; icon?: string }[] = [
    { value: "all", label: "All" },
    ...(Object.keys(WATCHLIST_STATUS_LABELS) as WatchlistStatus[]).map((key) => ({
      value: key,
      label: WATCHLIST_STATUS_LABELS[key].label,
      icon: WATCHLIST_STATUS_LABELS[key].icon,
    })),
  ];

  const types = [
    { value: "all", label: "All" },
    { value: "movie", label: "Movies" },
    { value: "series", label: "Series" },
    { value: "anime", label: "Anime" },
  ];

  return (
    <div className="flex flex-col gap-4 border-b pb-4 mb-6">
      {/* Status Filter */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
        <div className="flex flex-wrap gap-1">
          {statuses.map((s) => {
            const active = currentStatus === s.value;
            return (
              <button
                key={s.value}
                onClick={() => onStatusChange(s.value)}
                className={cn(
                  "text-xs h-7 px-3 py-1 rounded-full border transition-all duration-150 flex items-center gap-1.5 select-none cursor-pointer",
                  active
                    ? "bg-primary border-primary text-primary-foreground font-semibold"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-accent/40"
                )}
              >
                {s.icon && <span className="text-[10px]">{s.icon}</span>}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Type Filter */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Type</span>
        <div className="flex flex-wrap gap-1">
          {types.map((t) => {
            const active = currentType === t.value;
            return (
              <button
                key={t.value}
                onClick={() => onTypeChange(t.value)}
                className={cn(
                  "text-xs h-7 px-3 py-1 rounded-full border transition-all duration-150 select-none cursor-pointer",
                  active
                    ? "bg-primary border-primary text-primary-foreground font-semibold"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-accent/40"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
