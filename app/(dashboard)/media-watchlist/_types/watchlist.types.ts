export type WatchlistStatus = "planned" | "planning" | "upcoming" | "watching" | "completed" | "dropped";
export type WatchlistSource = "tmdb" | "anilist";
export type WatchlistMediaType = "movie" | "series" | "anime";

export interface WatchlistItem {
  _id?: string;
  userId: string;
  externalId: string;
  source: WatchlistSource;
  type: WatchlistMediaType;
  status: WatchlistStatus;
  rating?: number;
  metadata?: {
    title: string;
    posterUrl?: string;
    releaseYear?: number;
    releaseDate?: string;
    nextEpisodeDate?: string;
    nextEpisodeNumber?: number;
    runtime?: number;
    genres?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}


export interface SearchResult {
  externalId: string;
  source: WatchlistSource;
  type: WatchlistMediaType;
  title: string;
  posterUrl: string | null;
  releaseYear?: number;
}
