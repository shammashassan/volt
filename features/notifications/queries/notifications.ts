import { getDb } from '@/lib/db';
import { cacheTag } from 'next/cache';
import { Notification } from '../schemas/notification';

/**
 * Cached RSC data-fetcher for a user's notifications.
 * Tagged with 'notifications' so revalidateTag('notifications') in server
 * actions instantly busts this cache — no client reload needed.
 */
export async function getCachedNotifications(userId: string): Promise<Notification[]> {
  'use cache';
  cacheTag('notifications', `notifications-${userId}`);

  const db = await getDb();
  const items = await db
    .collection<Notification>('notifications')
    .find({ userId, deletedAt: { $exists: false } })
    .sort({ createdAt: -1 })
    .toArray();

  return JSON.parse(JSON.stringify(items)) as Notification[];
}
