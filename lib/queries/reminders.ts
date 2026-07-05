import { getDb } from '@/lib/db';
import { cacheTag } from 'next/cache';
import { Reminder } from '@/types/reminder';

/**
 * Cached RSC data-fetcher for a user's reminders.
 * Tagged with 'reminders' so revalidateTag('reminders') in server actions
 * instantly busts this cache — no client reload needed.
 */
export async function getCachedReminders(userId: string): Promise<Reminder[]> {
  'use cache';
  cacheTag('reminders', `reminders-${userId}`);

  const db = await getDb();
  const items = await db
    .collection<Reminder>('reminders')
    .find({ userId, deletedAt: { $exists: false } })
    .sort({ status: 1, triggerAt: 1 })
    .toArray();

  return JSON.parse(JSON.stringify(items)) as Reminder[];
}
