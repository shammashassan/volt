export interface WatchlistProviderDetails {
  releaseDate?: string;
  nextEpisodeDate?: string;
  nextEpisodeNumber?: number;
  posterUrl?: string;
  runtime?: number;
  genres?: string[];
  status?: string;
}

export interface WatchlistProvider {
  sync(externalId: string, mediaType: 'movie' | 'series' | 'anime'): Promise<WatchlistProviderDetails>;
}
