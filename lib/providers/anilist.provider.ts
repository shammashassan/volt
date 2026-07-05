import { WatchlistProvider, WatchlistProviderDetails } from './provider.interface';

export class AnilistProvider implements WatchlistProvider {
  async sync(externalId: string): Promise<WatchlistProviderDetails> {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          status
          coverImage {
            large
          }
          genres
          duration
          startDate {
            year
            month
            day
          }
          nextAiringEpisode {
            airingAt
            episode
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables: { id: parseInt(externalId, 10) } }),
    });

    if (!response.ok) throw new Error(`AniList GraphQL error: ${response.status}`);
    const body = await response.json();
    const media = body.data?.Media;

    if (!media) throw new Error('AniList Media details not found');

    const startDate = media.startDate;
    const releaseDate = startDate?.year && startDate?.month && startDate?.day
      ? `${startDate.year}-${String(startDate.month).padStart(2, '0')}-${String(startDate.day).padStart(2, '0')}`
      : undefined;

    const nextEpisodeDate = media.nextAiringEpisode?.airingAt
      ? new Date(media.nextAiringEpisode.airingAt * 1000).toISOString().split('T')[0]
      : undefined;

    return {
      releaseDate,
      nextEpisodeDate,
      nextEpisodeNumber: media.nextAiringEpisode?.episode,
      posterUrl: media.coverImage?.large,
      runtime: media.duration,
      genres: media.genres,
      status: media.status
    };
  }
}
