import { getDb } from '@/lib/db';
import { WatchlistService } from '@/lib/services/watchlist.service';
import { ReminderService } from '@/lib/services/reminder.service';

/**
 * On-demand synchronization of due alerts for the active user.
 * Runs when notifications are fetched to guarantee alerts are delivered
 * even if webhook schedulers or background crons were delayed.
 */
export async function syncUserAlerts(userId: string): Promise<void> {
  const db = await getDb();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Process due reminders for this user
  try {
    const dueReminders = await db.collection('reminders').find({
      userId,
      status: 'pending',
      triggerAt: { $lte: now },
      'notification.sentAt': { $exists: false }
    }).limit(5).toArray();

    for (const r of dueReminders) {
      await ReminderService.processReminderById(r._id.toString());
    }
  } catch (err) {
    console.error('[NotificationSync] Error syncing due reminders:', err);
  }

  // 2. Process watchlist releases & episodes (strict status preservation)
  try {
    const pendingWatchlist = await db.collection('watchlist').find({
      userId,
      deletedAt: { $exists: false },
      $or: [
        // Movie: status === 'planned', and releaseDate or ottReleaseDate <= today and not yet notified
        {
          type: 'movie',
          status: 'planned',
          $or: [
            { 'metadata.releaseDate': { $exists: true, $ne: null, $lte: todayStr }, 'sync.releasedNotified': { $ne: true } },
            { 'metadata.ottReleaseDate': { $exists: true, $ne: null, $lte: todayStr }, 'sync.ottReleasedNotified': { $ne: true } }
          ]
        },
        // Series / Anime: status === 'watching', and nextEpisodeDate <= today
        {
          type: { $in: ['series', 'anime'] },
          status: 'watching',
          'metadata.nextEpisodeDate': { $exists: true, $ne: null, $lte: todayStr }
        }
      ]
    }).limit(5).toArray();

    for (const item of pendingWatchlist) {
      if (item.type === 'series' || item.type === 'anime') {
        const nextEp = item.metadata?.nextEpisodeNumber;
        const lastNotified = item.sync?.lastNotifiedEpisode || 0;
        if (nextEp !== undefined && nextEp <= lastNotified) {
          continue;
        }
      }
      await WatchlistService.syncItem(item, now);
    }
  } catch (err) {
    console.error('[NotificationSync] Error syncing watchlist alerts:', err);
  }
}
