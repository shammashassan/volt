import { ReminderRepository } from '../repositories/reminder.repository';
import { Reminder } from '../schemas/reminder';
import { UserId } from '@/features/shared/types';
import { EventBus } from '@/features/shared/event-bus';
import { NotificationService } from '@/features/notifications/services/notification.service';

export class ReminderService {
  private static repo = new ReminderRepository();

  public static async createReminder(data: Omit<Reminder, 'createdAt' | 'updatedAt' | 'status' | 'notified'>): Promise<Reminder> {
    return this.repo.create({
      ...data,
      status: 'pending',
      notification: {}
    });
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
