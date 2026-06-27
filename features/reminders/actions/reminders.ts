"use server";

import { ReminderRepository } from '../repositories/reminder.repository';
import { Reminder, ReminderStatus, ReminderPriority, ReminderAttachment } from '../schemas/reminder';
import { getSessionUser, getErrorMessage } from '@/lib/auth-utils';
import { updateTag, revalidatePath } from 'next/cache';
import { parseReminderText } from '@/lib/utils/parser';
import { ReminderService } from '../services/reminder.service';

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
    const reminder = await ReminderService.createReminder({
      userId: user.id,
      title: payload.title,
      description: payload.description,
      priority: payload.priority,
      triggerAt: new Date(payload.triggerAt),
      attachments: payload.attachments || []
    });

    updateTag('reminders');
    updateTag(`reminders-${user.id}`);
    updateTag(`explore-body-${user.id}`);
    revalidatePath('/reminders');
    revalidatePath('/explore');
    return { success: true, data: JSON.parse(JSON.stringify(reminder)) as Reminder };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function createReminderFromTextAction(text: string, priority: ReminderPriority, attachments?: ReminderAttachment[], clientOffset?: number) {
  try {
    const user = await getSessionUser();
    const parsed = await parseReminderText(text, clientOffset);
    const triggerAt = parsed.triggerAt || new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow

    const reminder = await ReminderService.createReminder({
      userId: user.id,
      title: parsed.title,
      priority,
      triggerAt,
      attachments: attachments || []
    });

    updateTag('reminders');
    updateTag(`reminders-${user.id}`);
    updateTag(`explore-body-${user.id}`);
    revalidatePath('/reminders');
    revalidatePath('/explore');
    return { success: true, data: JSON.parse(JSON.stringify(reminder)) as Reminder };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function updateReminderAction(id: string, updates: Partial<Reminder>) {
  try {
    const user = await getSessionUser();
    const reminder = await ReminderService.updateReminder(id, user.id, {
      ...updates,
      ...(updates.triggerAt ? { triggerAt: new Date(updates.triggerAt) } : {})
    });

    updateTag('reminders');
    updateTag(`reminders-${user.id}`);
    updateTag(`explore-body-${user.id}`);
    revalidatePath('/reminders');
    revalidatePath('/explore');
    return { success: true, data: JSON.parse(JSON.stringify(reminder)) as Reminder };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function deleteReminderAction(id: string) {
  try {
    const user = await getSessionUser();
    const success = await ReminderService.deleteReminder(id, user.id);

    updateTag('reminders');
    updateTag(`reminders-${user.id}`);
    updateTag(`explore-body-${user.id}`);
    revalidatePath('/reminders');
    revalidatePath('/explore');
    return { success: true, data: success };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function completeReminderAction(id: string) {
  try {
    const user = await getSessionUser();
    const reminder = await ReminderService.updateReminder(id, user.id, {
      status: 'completed',
    });

    updateTag('reminders');
    updateTag(`reminders-${user.id}`);
    updateTag(`explore-body-${user.id}`);
    revalidatePath('/reminders');
    revalidatePath('/notifications');
    revalidatePath('/explore');
    return { success: true, data: JSON.parse(JSON.stringify(reminder)) as Reminder };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
