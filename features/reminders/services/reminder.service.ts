import { ReminderRepository } from '../repositories/reminder.repository';
import { Reminder } from '../schemas/reminder';
import { UserId } from '@/features/shared/types';
import { EventBus } from '@/features/shared/event-bus';
import { NotificationService } from '@/features/notifications/services/notification.service';
import { SearchIndexRepository } from '@/features/search/repositories/search-index.repository';

export class ReminderService {
  private static repo = new ReminderRepository();
  private static searchIndexRepo = new SearchIndexRepository();

  public static async createReminder(data: Omit<Reminder, 'createdAt' | 'updatedAt' | 'status' | 'notification'>): Promise<Reminder> {
    const reminder = await this.repo.create({
      ...data,
      status: 'pending',
      notification: {}
    });

    await this.searchIndexRepo.upsert({
      userId: reminder.userId,
      title: reminder.title,
      description: reminder.description,
      entityType: 'reminder',
      entityId: reminder._id!.toString()
    });

    return reminder;
  }

  public static async updateReminder(id: string, userId: UserId, updates: Partial<Reminder>): Promise<Reminder | null> {
    const reminder = await this.repo.update(id, userId, updates);
    if (reminder) {
      await this.searchIndexRepo.upsert({
        userId: reminder.userId,
        title: reminder.title,
        description: reminder.description,
        entityType: 'reminder',
        entityId: reminder._id!.toString()
      });
    }
    return reminder;
  }

  public static async deleteReminder(id: string, userId: UserId): Promise<boolean> {
    const success = await this.repo.softDelete(id, userId);
    if (success) {
      await this.searchIndexRepo.remove(id);
    }
    return success;
  }

  public static async processDueReminders(): Promise<number> {
    const now = new Date();
    const due = await this.repo.findDue(now);
    const bus = EventBus.getInstance();

    for (const reminder of due) {
      // 1. Create notification event via NotificationService
      await NotificationService.createNotification(
        reminder.userId,
        `Reminder: ${reminder.title}`,
        reminder.description || 'Your scheduled reminder is due now.',
        'reminder.due',
        `/reminders`
      );

      // 2. Set complete status
      await this.repo.update(reminder._id!.toString(), reminder.userId, {
        status: 'completed',
        notification: {
          sentAt: now,
          lastNotifiedAt: now
        }
      });

      // 3. Publish to Event Bus
      bus.publish('reminder.completed', { reminderId: reminder._id!.toString(), userId: reminder.userId });
    }

    return due.length;
  }
}

