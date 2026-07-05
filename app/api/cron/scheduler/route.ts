import { NextRequest, NextResponse } from 'next/server';
import { JobRegistry, Job } from '@/lib/services/automation-registry';
import { ReminderService } from '@/lib/services/reminder.service';
import { NotificationService } from '@/lib/services/notification.service';
import { WatchlistService } from '@/lib/services/watchlist.service';
import { SchedulerService } from '@/lib/scheduler/scheduler.service';
import { getDb } from '@/lib/db';

class ReminderJob implements Job {
  name = 'ReminderJob';
  priority = 1;
  async run() {
    const itemsProcessed = await ReminderService.processDueReminders();
    return { itemsProcessed };
  }
}

class WatchlistSyncJob implements Job {
  name = 'WatchlistSyncJob';
  priority = 2;
  async run() {
    const itemsProcessed = await WatchlistService.syncPendingMetadata();
    return { itemsProcessed };
  }
}

class RetryFailedSchedulesJob implements Job {
  name = 'RetryFailedSchedulesJob';
  priority = 3;
  async run() {
    const db = await getDb();
    let retriedCount = 0;

    // 1. Reschedule failed reminders
    const failedReminders = await db.collection('reminders').find({
      'scheduler.status': 'failed',
      status: 'pending',
      triggerAt: { $gt: new Date() }
    }).toArray();

    for (const r of failedReminders) {
      try {
        console.log(`[Scheduler Daily Fallback] Retrying scheduling for reminder ${r._id}`);
        const messageId = await SchedulerService.schedule(
          '/api/scheduler/reminders',
          { id: r._id.toString() },
          new Date(r.triggerAt)
        );
        await db.collection('reminders').updateOne(
          { _id: r._id },
          {
            $set: {
              'scheduler.status': 'scheduled',
              'scheduler.messageId': messageId,
              'scheduler.scheduledAt': new Date().toISOString(),
              'scheduler.error': null
            }
          }
        );
        retriedCount++;
      } catch (err: any) {
        console.error(`[Scheduler Daily Fallback] Failed to reschedule reminder ${r._id}:`, err);
      }
    }

    // 2. Reschedule failed watchlist items (triggering syncItem will re-evaluate and retry scheduling)
    const failedWatchlist = await db.collection('watchlist').find({
      'scheduler.status': 'failed',
      status: { $in: ['planned', 'watching'] },
      deletedAt: { $exists: false }
    }).toArray();

    for (const w of failedWatchlist) {
      try {
        console.log(`[Scheduler Daily Fallback] Retrying sync for watchlist item ${w._id}`);
        await WatchlistService.syncItem(w);
        retriedCount++;
      } catch (err: any) {
        console.error(`[Scheduler Daily Fallback] Failed to sync failed watchlist item ${w._id}:`, err);
      }
    }

    return { itemsProcessed: retriedCount };
  }
}

class CleanupJob implements Job {
  name = 'CleanupJob';
  priority = 4;
  async run() {
    const notificationsPurged = await NotificationService.purgeOldNotifications();
    const remindersPurged = await ReminderService.cleanupOldReminders();
    return { itemsProcessed: notificationsPurged + remindersPurged };
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (process.env.NODE_ENV === 'production' || cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const registry = new JobRegistry([
      new ReminderJob(),
      new WatchlistSyncJob(),
      new RetryFailedSchedulesJob(),
      new CleanupJob()
    ]);

    const results = await registry.runAll();
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

