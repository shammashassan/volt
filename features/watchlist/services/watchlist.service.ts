import { getDb } from '@/lib/db';
import { WatchlistItem } from '@/app/(dashboard)/media-watchlist/_types/watchlist.types';
import { TmdbProvider } from '../providers/tmdb.provider';
import { AnilistProvider } from '../providers/anilist.provider';
import { NotificationService } from '@/features/notifications/services/notification.service';
import { ObjectId } from 'mongodb';

export class WatchlistService {
  private static providers = {
    tmdb: new TmdbProvider(),
    anilist: new AnilistProvider()
  };

  public static async syncItem(item: any, now: Date = new Date()): Promise<void> {
    const db = await getDb();
    const col = db.collection('watchlist');
    const provider = this.providers[item.source as 'tmdb' | 'anilist'];
    if (!provider) return;

    const details = await provider.sync(item.externalId, item.type);
    
    // Determine release and episode checks based on media type
    const isMovie = item.type === 'movie';
    const isEpisodic = item.type === 'series' || item.type === 'anime';
    
    let upcomingReleased = false;
    let newEpisodeAired = false;
    let airedEpisodeNumber: number | undefined = undefined;

    const releasedNotified = item.sync?.releasedNotified || false;
    const lastNotifiedEpisode = item.sync?.lastNotifiedEpisode || 0;

    if (isMovie) {
      upcomingReleased = !!(
        details.releaseDate && 
        new Date(details.releaseDate) <= now && 
        item.status === 'planned' && 
        !releasedNotified
      );
    } else if (isEpisodic) {
      // Trigger episode alert if status is 'watching' and a new episode has aired
      if (item.status === 'watching' && item.metadata?.nextEpisodeNumber) {
        const storedEpisode = item.metadata.nextEpisodeNumber;
        const fetchedEpisode = details.nextEpisodeNumber;
        const storedDate = item.metadata.nextEpisodeDate;

        if (fetchedEpisode && fetchedEpisode > storedEpisode && storedEpisode > lastNotifiedEpisode) {
          newEpisodeAired = true;
          airedEpisodeNumber = storedEpisode;
        } else if (!fetchedEpisode && storedDate && new Date(storedDate) <= now && storedEpisode > lastNotifiedEpisode) {
          // Next episode is null/undefined, meaning the final episode has aired
          newEpisodeAired = true;
          airedEpisodeNumber = storedEpisode;
        }
      }
    }
    
    const updates: any = {
      metadata: {
        ...item.metadata,
        posterUrl: details.posterUrl || item.metadata?.posterUrl,
        releaseDate: details.releaseDate,
        nextEpisodeDate: details.nextEpisodeDate,
        nextEpisodeNumber: details.nextEpisodeNumber,
        runtime: details.runtime,
        genres: details.genres
      },
      sync: {
        lastChecked: now,
        provider: item.source,
        providerId: item.externalId,
        version: (item.sync?.version || 0) + 1,
        failedAttempts: 0,
        releasedNotified: upcomingReleased ? true : releasedNotified,
        lastNotifiedEpisode: newEpisodeAired && airedEpisodeNumber !== undefined ? airedEpisodeNumber : lastNotifiedEpisode
      },
      updatedAt: now
    };

    if (upcomingReleased && isMovie) {
      // Trigger movie release notification
      await NotificationService.createNotification(
        item.userId,
        `Released: ${item.metadata?.title || 'Watchlist Item'}`,
        `Your planned item "${item.metadata?.title || ''}" is officially released!`,
        'watchlist.release',
        '/media-watchlist'
      );
    }

    if (newEpisodeAired && airedEpisodeNumber !== undefined) {
      // Trigger new episode alert
      await NotificationService.createNotification(
        item.userId,
        `New Episode: ${item.metadata?.title || 'Series'}`,
        `Episode ${airedEpisodeNumber} of ${item.metadata?.title || ''} is now airing!`,
        'watchlist.episode',
        '/media-watchlist'
      );
    }

    await col.updateOne({ _id: item._id }, { $set: updates });
  }

  public static async syncItemById(id: string | ObjectId): Promise<boolean> {
    const db = await getDb();
    const col = db.collection('watchlist');
    const item = await col.findOne({ _id: new ObjectId(id) });
    if (!item) return false;
    await this.syncItem(item);
    return true;
  }

  public static async syncPendingMetadata(): Promise<number> {
    const db = await getDb();
    const col = db.collection('watchlist');
    
    // Fetch 25 oldest check-ins needing update (focusing on planned and watching statuses)
    const staleItems = await col.find({
      status: { $in: ['planned', 'watching'] },
      deletedAt: { $exists: false }
    }).sort({ 'sync.lastChecked': 1 }).limit(25).toArray();

    let count = 0;
    const now = new Date();

    for (const item of staleItems) {
      try {
        await this.syncItem(item, now);
        count++;
      } catch (err) {
        console.error(`Failed to sync watchlist item ${item._id}:`, err);
        await col.updateOne({ _id: item._id }, {
          $set: {
            'sync.lastChecked': now,
            'sync.failedAttempts': (item.sync?.failedAttempts || 0) + 1,
            updatedAt: now
          }
        });
      }
    }

    return count;
  }
}
