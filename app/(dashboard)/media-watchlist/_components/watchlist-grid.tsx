import React from "react";
import { WatchlistItem, WatchlistStatus } from "../_types/watchlist.types";
import { WatchlistCard } from "./watchlist-card";

interface WatchlistGridProps {
  items: WatchlistItem[];
  onUpdateStatus: (id: string, status: WatchlistStatus) => void;
  onUpdateRating: (id: string, rating: number | null) => void;
  onDelete: (id: string) => void;
}

export function WatchlistGrid({ items, onUpdateStatus, onUpdateRating, onDelete }: WatchlistGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {items.map((item) => (
        <WatchlistCard
          key={item._id}
          item={item}
          onUpdateStatus={onUpdateStatus}
          onUpdateRating={onUpdateRating}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
