import { ScheduleMetadata } from "@/lib/scheduler/types";

export type WatchlistStatus = "planned" | "watching" | "completed" | "dropped";
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
    theatricalReleaseDate?: string;
    ottReleaseDate?: string;
    nextEpisodeDate?: string;
    nextEpisodeNumber?: number;
    runtime?: number;
    genres?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  scheduler?: {
    theatrical?: ScheduleMetadata;
    ott?: ScheduleMetadata;
    episode?: ScheduleMetadata;
  };
}



export interface SearchResult {
  externalId: string;
  source: WatchlistSource;
  type: WatchlistMediaType;
  title: string;
  posterUrl: string | null;
  releaseYear?: number;
}
