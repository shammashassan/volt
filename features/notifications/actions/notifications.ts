"use server";

import { NotificationRepository } from '../repositories/notification.repository';
import { Notification } from '../schemas/notification';
import { getSessionUser, getErrorMessage } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

const repo = new NotificationRepository();

export async function getNotificationsAction() {
  try {
    const user = await getSessionUser();
    const db = await repo.getCollection();
    const items = await db.find({
      userId: user.id,
      deletedAt: { $exists: false }
    }).sort({ createdAt: -1 }).toArray();

    return { success: true, data: JSON.parse(JSON.stringify(items)) as Notification[] };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function markNotificationReadAction(id: string) {
  try {
    const user = await getSessionUser();
    const success = await repo.markRead(id, user.id);

    revalidatePath('/notifications');
    return { success: true, data: success };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function archiveNotificationAction(id: string) {
  try {
    const user = await getSessionUser();
    const success = await repo.archive(id, user.id);

    revalidatePath('/notifications');
    return { success: true, data: success };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function deleteNotificationAction(id: string) {
  try {
    const user = await getSessionUser();
    const success = await repo.softDelete(id, user.id);

    revalidatePath('/notifications');
    return { success: true, data: success };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
