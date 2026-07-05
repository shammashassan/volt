import { getDb } from '@/lib/db';
import { WatchlistItem } from '@/types/watchlist';
import { TmdbProvider } from '@/lib/providers/tmdb.provider';
import { AnilistProvider } from '@/lib/providers/anilist.provider';
import { NotificationService } from '@/lib/services/notification.service';
import { ObjectId } from 'mongodb';
import { SchedulerService } from '@/lib/scheduler/scheduler.service';

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
    let upcomingOttReleased = false;
    let newEpisodeAired = false;
    let airedEpisodeNumber: number | undefined = undefined;

    const releasedNotified = item.sync?.releasedNotified || false;
    const ottReleasedNotified = item.sync?.ottReleasedNotified || false;
    const lastNotifiedEpisode = item.sync?.lastNotifiedEpisode || 0;

    if (isMovie) {
      upcomingReleased = !!(
        details.releaseDate && 
        new Date(details.releaseDate) <= now && 
        item.status === 'planned' && 
        !releasedNotified
      );
      upcomingOttReleased = !!(
        details.ottReleaseDate && 
        new Date(details.ottReleaseDate) <= now && 
        item.status === 'planned' && 
        !ottReleasedNotified
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
        theatricalReleaseDate: details.releaseDate,
        ottReleaseDate: details.ottReleaseDate,
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
        ottReleasedNotified: upcomingOttReleased ? true : ottReleasedNotified,
        lastNotifiedEpisode: newEpisodeAired && airedEpisodeNumber !== undefined ? airedEpisodeNumber : lastNotifiedEpisode
      },
      updatedAt: now,
      scheduler: {
        ...(item.scheduler || {})
      }
    };

    if (upcomingReleased && isMovie) {
      // Trigger movie release notification
      await NotificationService.createNotification(
        item.userId,
        `Released: ${item.metadata?.title || 'Watchlist Item'}`,
        `Your planned item "${item.metadata?.title || ''}" is officially released!`,
        'watchlist.release',
        '/media-watchlist',
        details.posterUrl || item.metadata?.posterUrl
      );
    }

    if (upcomingOttReleased && isMovie) {
      // Trigger movie OTT release notification
      await NotificationService.createNotification(
        item.userId,
        `Streaming: ${item.metadata?.title || 'Watchlist Item'}`,
        `Your planned item "${item.metadata?.title || ''}" is now streaming!`,
        'watchlist.release',
        '/media-watchlist',
        details.posterUrl || item.metadata?.posterUrl
      );
    }

    if (newEpisodeAired && airedEpisodeNumber !== undefined) {
      // Trigger new episode alert
      await NotificationService.createNotification(
        item.userId,
        `New Episode: ${item.metadata?.title || 'Series'}`,
        `Episode ${airedEpisodeNumber} of ${item.metadata?.title || ''} is now airing!`,
        'watchlist.episode',
        '/media-watchlist',
        details.posterUrl || item.metadata?.posterUrl
      );
    }

    // Helper to schedule a job type and update updates.scheduler
    const handleScheduleJob = async (
      jobType: 'theatrical' | 'ott' | 'episode',
      targetDate: Date | undefined,
      isActiveStatus: boolean,
      isNotified: boolean
    ) => {
      const existingJob = item.scheduler?.[jobType];
      const currentScheduledFor = existingJob?.scheduledFor;
      const shouldSchedule = targetDate && targetDate > now && isActiveStatus && !isNotified;

      if (shouldSchedule) {
        const targetIso = targetDate.toISOString();
        if (currentScheduledFor !== targetIso || !existingJob?.messageId) {
          // Cancel existing QStash job
          if (existingJob?.messageId) {
            console.log(`[Scheduler] Cancelling existing watchlist ${jobType} schedule ${existingJob.messageId} for item ${item._id}`);
            await SchedulerService.cancel(existingJob.messageId);
          }

          // Add random jitter (0 to 10 seconds)
          const jitterSeconds = Math.floor(Math.random() * 10);
          const scheduledDate = new Date(targetDate.getTime() + jitterSeconds * 1000);

          try {
            console.log(`[Scheduler] Scheduling watchlist ${jobType} trigger for item ${item._id} at ${scheduledDate.toISOString()}`);
            const messageId = await SchedulerService.schedule(
              '/api/scheduler/watchlist',
              { id: item._id.toString(), type: jobType },
              scheduledDate
            );

            updates.scheduler[jobType] = {
              provider: 'qstash',
              status: 'scheduled',
              messageId,
              scheduledFor: targetIso,
              scheduledAt: now.toISOString()
            };
          } catch (err: any) {
            console.error(`[Scheduler] Failed to schedule QStash message for ${jobType} on watchlist item ${item._id}:`, err);
            updates.scheduler[jobType] = {
              provider: 'qstash',
              status: 'failed',
              scheduledFor: targetIso,
              error: err.message || String(err)
            };
          }
        }
      } else {
        // Cancel if scheduled but conditions no longer met
        if (existingJob?.messageId) {
          console.log(`[Scheduler] Cancelling active watchlist ${jobType} schedule ${existingJob.messageId} for item ${item._id} (conditions no longer met)`);
          await SchedulerService.cancel(existingJob.messageId);
          updates.scheduler[jobType] = {
            provider: 'qstash',
            status: 'idle',
            lastTriggeredAt: now.toISOString(),
            scheduledFor: existingJob.scheduledFor
          };
        }
      }
    };

    if (isMovie) {
      const theatricalDateObj = details.releaseDate ? new Date(details.releaseDate) : undefined;
      const ottDateObj = details.ottReleaseDate ? new Date(details.ottReleaseDate) : undefined;

      await handleScheduleJob('theatrical', theatricalDateObj, item.status === 'planned', updates.sync.releasedNotified);
      await handleScheduleJob('ott', ottDateObj, item.status === 'planned', updates.sync.ottReleasedNotified);
    } else if (isEpisodic) {
      const episodeDateObj = details.nextEpisodeDate ? new Date(details.nextEpisodeDate) : undefined;
      await handleScheduleJob('episode', episodeDateObj, item.status === 'watching', false);
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

  public static async processWatchlistTrigger(
    id: string,
    type: 'theatrical' | 'ott' | 'episode'
  ): Promise<void> {
    const db = await getDb();
    const col = db.collection('watchlist');
    const item = await col.findOne({ _id: new ObjectId(id) });
    if (!item) {
      console.warn(`[Scheduler] Watchlist item ${id} not found, skipping processing.`);
      return;
    }

    const now = new Date();

    if (type === 'theatrical') {
      // Idempotency check
      if (item.sync?.releasedNotified) {
        console.log(`[Scheduler] Watchlist item ${id} already notified for theatrical release (Idempotent).`);
        return;
      }

      console.log(`[Scheduler] Processing theatrical release trigger for movie: ${item.metadata?.title}`);

      await NotificationService.createNotification(
        item.userId,
        `Released: ${item.metadata?.title || 'Watchlist Item'}`,
        `Your planned item "${item.metadata?.title || ''}" is officially released!`,
        'watchlist.release',
        '/media-watchlist',
        item.metadata?.posterUrl
      );

      await col.updateOne(
        { _id: item._id },
        {
          $set: {
            'sync.releasedNotified': true,
            'scheduler.theatrical': {
              provider: 'qstash',
              status: 'idle',
              lastTriggeredAt: now.toISOString(),
              scheduledFor: item.scheduler?.theatrical?.scheduledFor
            },
            updatedAt: now
          }
        }
      );
    } else if (type === 'ott') {
      // Idempotency check
      if (item.sync?.ottReleasedNotified) {
        console.log(`[Scheduler] Watchlist item ${id} already notified for OTT release (Idempotent).`);
        return;
      }

      console.log(`[Scheduler] Processing OTT release trigger for movie: ${item.metadata?.title}`);

      await NotificationService.createNotification(
        item.userId,
        `Streaming: ${item.metadata?.title || 'Watchlist Item'}`,
        `Your planned item "${item.metadata?.title || ''}" is now streaming!`,
        'watchlist.release',
        '/media-watchlist',
        item.metadata?.posterUrl
      );

      await col.updateOne(
        { _id: item._id },
        {
          $set: {
            'sync.ottReleasedNotified': true,
            'scheduler.ott': {
              provider: 'qstash',
              status: 'idle',
              lastTriggeredAt: now.toISOString(),
              scheduledFor: item.scheduler?.ott?.scheduledFor
            },
            updatedAt: now
          }
        }
      );
    } else if (type === 'episode') {
      // For episodic air date checks:
      // Calling syncItem will run TMDb/Anilist sync, notify if aired,
      // and schedule the NEXT episode's air date job.
      console.log(`[Scheduler] Processing episode release trigger for series: ${item.metadata?.title}`);
      await this.syncItem(item, now);
    }
  }

  public static async syncPendingMetadata(): Promise<number> {
    const db = await getDb();
    const col = db.collection('watchlist');
    const now = new Date();
    const nowIso = now.toISOString();
    
    // Fetch 25 oldest check-ins needing update
    const staleItems = await col.find({
      status: { $in: ['planned', 'watching'] },
      deletedAt: { $exists: false },
      $or: [
        { 'sync.lastChecked': { $exists: false } },
        { 'sync.lastChecked': null },
        { 'sync.lastChecked': { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        {
          type: 'movie',
          $or: [
            { 'scheduler.theatrical.status': 'failed' },
            { 'scheduler.ott.status': 'failed' },
            { 'scheduler.theatrical': { $exists: false } },
            { 'scheduler.ott': { $exists: false } },
            { 'scheduler.theatrical.status': 'scheduled', 'scheduler.theatrical.scheduledFor': { $lte: nowIso } },
            { 'scheduler.ott.status': 'scheduled', 'scheduler.ott.scheduledFor': { $lte: nowIso } }
          ]
        },
        {
          type: { $in: ['series', 'anime'] },
          $or: [
            { 'scheduler.episode.status': 'failed' },
            { 'scheduler.episode': { $exists: false } },
            { 'scheduler.episode.status': 'scheduled', 'scheduler.episode.scheduledFor': { $lte: nowIso } }
          ]
        }
      ]
    }).sort({ 'sync.lastChecked': 1 }).limit(25).toArray();

    let count = 0;

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
