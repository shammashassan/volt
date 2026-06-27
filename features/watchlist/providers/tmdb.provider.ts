import { WatchlistProvider, WatchlistProviderDetails } from './provider.interface';

export class TmdbProvider implements WatchlistProvider {
  async sync(externalId: string, mediaType: 'movie' | 'series' | 'anime'): Promise<WatchlistProviderDetails> {
    const tmdbKey = process.env.TMDB_API_KEY || '';
    const tmdbToken = process.env.TMDB_READ_TOKEN || '';
    if (!tmdbKey && !tmdbToken) {
      throw new Error('TMDb credentials missing');
    }

    const typePath = mediaType === 'movie' ? 'movie' : 'tv';
    const baseUrl = `https://api.themoviedb.org/3/${typePath}/${externalId}`;
    
    // Add release dates append query for movies
    const url = tmdbToken 
      ? `${baseUrl}?append_to_response=release_dates`
      : `${baseUrl}?api_key=${tmdbKey}&append_to_response=release_dates`;

    const headers: HeadersInit = {};
    if (tmdbToken) {
      headers['Authorization'] = `Bearer ${tmdbToken}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`TMDb HTTP error: ${response.status}`);
    const data = await response.json();

    const details: WatchlistProviderDetails = {
      posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w342${data.poster_path}` : undefined,
      runtime: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : undefined),
      genres: data.genres ? data.genres.map((g: any) => g.name) : [],
      status: data.status
    };

    if (mediaType === 'movie') {
      details.releaseDate = data.release_date;
      // Fetch digital release dates if possible
      const releaseResults = data.release_dates?.results || [];
      const usReleases = releaseResults.find((r: any) => r.iso_3166_1 === 'US')?.release_dates || [];
      const digital = usReleases.find((d: any) => d.type === 4); // Type 4 = Digital release
      if (digital) {
        details.ottReleaseDate = digital.release_date.split('T')[0];
      }
    } else {
      details.releaseDate = data.first_air_date;
      if (data.next_episode_to_air) {
        details.nextEpisodeDate = data.next_episode_to_air.air_date;
        details.nextEpisodeNumber = data.next_episode_to_air.episode_number;
      }
    }

    return details;
  }
}
