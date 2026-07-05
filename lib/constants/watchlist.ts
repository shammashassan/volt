import { WatchlistStatus, WatchlistMediaType } from "@/types/watchlist";

export const WATCHLIST_STATUS_LABELS: Record<WatchlistStatus, { label: string; icon: string }> = {
  planned: { label: "Planned", icon: "○" },
  watching: { label: "Watching", icon: "◐" },
  completed: { label: "Completed", icon: "✓" },
  dropped: { label: "Dropped", icon: "⊘" },
};

export const WATCHLIST_TYPE_LABELS: Record<WatchlistMediaType, string> = {
  movie: "Movie",
  series: "Series",
  anime: "Anime",
};
