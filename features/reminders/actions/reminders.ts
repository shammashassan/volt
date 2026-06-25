"use server";

import { ReminderRepository } from '../repositories/reminder.repository';
import { Reminder, ReminderStatus, ReminderPriority, ReminderAttachment } from '../schemas/reminder';
import { getSessionUser, getErrorMessage } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { parseReminderText } from '@/lib/utils/parser';

const repo = new ReminderRepository();

export async function getRemindersAction() {
  try {
    const user = await getSessionUser();
    const db = await repo.getCollection();
    const items = await db.find({
      userId: user.id,
      deletedAt: { $exists: false }
    }).sort({ status: 1, triggerAt: 1, sortOrder: 1 }).toArray();

    return { success: true, data: JSON.parse(JSON.stringify(items)) as Reminder[] };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function createReminderAction(payload: {
  title: string;
  description?: string;
  triggerAt: Date;
  priority: ReminderPriority;
  attachments?: ReminderAttachment[];
}) {
  try {
    const user = await getSessionUser();
    const reminder = await repo.create({
      userId: user.id,
      title: payload.title,
      description: payload.description,
      status: 'pending',
      priority: payload.priority,
      triggerAt: new Date(payload.triggerAt),
      attachments: payload.attachments || [],
      notification: {}
    });

    revalidatePath('/reminders');
    return { success: true, data: JSON.parse(JSON.stringify(reminder)) as Reminder };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function createReminderFromTextAction(text: string, priority: ReminderPriority) {
  try {
    const user = await getSessionUser();
    const parsed = parseReminderText(text);
    const triggerAt = parsed.triggerAt || new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow

    const reminder = await repo.create({
      userId: user.id,
      title: parsed.title,
      status: 'pending',
      priority,
      triggerAt,
      attachments: [],
      notification: {}
    });

    revalidatePath('/reminders');
    return { success: true, data: JSON.parse(JSON.stringify(reminder)) as Reminder };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function updateReminderAction(id: string, updates: Partial<Reminder>) {
  try {
    const user = await getSessionUser();
    const reminder = await repo.update(id, user.id, {
      ...updates,
      ...(updates.triggerAt ? { triggerAt: new Date(updates.triggerAt) } : {})
    });

    revalidatePath('/reminders');
    return { success: true, data: JSON.parse(JSON.stringify(reminder)) as Reminder };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function deleteReminderAction(id: string) {
  try {
    const user = await getSessionUser();
    const success = await repo.softDelete(id, user.id);

    revalidatePath('/reminders');
    return { success: true, data: success };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
