import { ReminderRepository } from '@/lib/repositories/reminder.repository';
import { Reminder } from '@/types/reminder';
import { UserId } from '@/types/shared';
import { EventBus } from '@/lib/event-bus';
import { NotificationService } from '@/lib/services/notification.service';
import { SearchIndexRepository } from '@/lib/repositories/search-index.repository';
import { SchedulerService } from '@/lib/scheduler/scheduler.service';

export class ReminderService {
  private static repo = new ReminderRepository();
  private static searchIndexRepo = new SearchIndexRepository();

  public static async createReminder(data: Omit<Reminder, 'createdAt' | 'updatedAt' | 'status' | 'notification'>): Promise<Reminder> {
    const triggerAt = new Date(data.triggerAt);
    
    // 1. Coordinated DB Insertion - Create in 'scheduling' state
    const reminder = await this.repo.create({
      ...data,
      status: 'pending',
      notification: {},
      scheduler: {
        provider: 'qstash',
        status: 'scheduling',
        scheduledFor: triggerAt.toISOString()
      }
    });

    const reminderId = reminder._id!.toString();

    // 2. Schedule via QStash
    try {
      console.log(`[Scheduler] Scheduling QStash reminder message for ${reminderId} at ${triggerAt.toISOString()}`);
      const messageId = await SchedulerService.schedule(
        '/api/scheduler/reminders',
        { id: reminderId },
        triggerAt
      );

      // 3. Update DB to 'scheduled' state
      await this.repo.update(reminderId, reminder.userId, {
        scheduler: {
          provider: 'qstash',
          status: 'scheduled',
          messageId,
          scheduledFor: triggerAt.toISOString(),
          scheduledAt: new Date().toISOString()
        }
      });
      
      reminder.scheduler = {
        provider: 'qstash',
        status: 'scheduled',
        messageId,
        scheduledFor: triggerAt.toISOString(),
        scheduledAt: new Date().toISOString()
      };
    } catch (err: any) {
      console.error(`[Scheduler] Failed to schedule QStash message for reminder ${reminderId}:`, err);
      
      // Update DB to 'failed' state so it can be picked up by fallback mechanisms
      await this.repo.update(reminderId, reminder.userId, {
        scheduler: {
          provider: 'qstash',
          status: 'failed',
          scheduledFor: triggerAt.toISOString(),
          error: err.message || String(err)
        }
      });

      reminder.scheduler = {
        provider: 'qstash',
        status: 'failed',
        scheduledFor: triggerAt.toISOString(),
        error: err.message || String(err)
      };

      throw new Error(`Failed to schedule reminder notification: ${err.message || err}`);
    }

    await this.searchIndexRepo.upsert({
      userId: reminder.userId,
      title: reminder.title,
      description: reminder.description,
      entityType: 'reminder',
      entityId: reminderId
    });

    return reminder;
  }

  public static async updateReminder(id: string, userId: UserId, updates: Partial<Reminder>): Promise<Reminder | null> {
    const existing = await this.repo.findById(id, userId);
    
    // If status is being updated to completed or cancelled, cancel any active schedule
    if (existing && updates.status && ['completed', 'cancelled'].includes(updates.status)) {
      if (existing.scheduler?.messageId) {
        console.log(`[Scheduler] Cancelling active QStash schedule ${existing.scheduler.messageId} for reminder ${id} (status changed to ${updates.status})`);
        await SchedulerService.cancel(existing.scheduler.messageId);
        updates.scheduler = {
          provider: 'qstash',
          status: 'idle',
          lastScheduledAt: existing.scheduler.scheduledAt
        };
      }
    }

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
    const existing = await this.repo.findById(id, userId);
    if (existing && existing.scheduler?.messageId) {
      console.log(`[Scheduler] Cancelling active QStash schedule ${existing.scheduler.messageId} for deleted reminder ${id}`);
      await SchedulerService.cancel(existing.scheduler.messageId);
    }

    const success = await this.repo.hardDelete(id, userId);
    if (success) {
      await this.searchIndexRepo.remove(id);
    }
    return success;
  }

  public static async processReminderById(id: string): Promise<void> {
    const reminder = await this.repo.findByIdRaw(id);
    if (!reminder) {
      console.warn(`[Scheduler] Reminder ${id} not found, skipping processing.`);
      return;
    }

    // Idempotency check: Ignore if already completed or cancelled
    if (reminder.status === 'completed' || reminder.status === 'cancelled') {
      console.log(`[Scheduler] Reminder ${id} is already in status '${reminder.status}', skipping processing (Idempotent).`);
      return;
    }

    console.log(`[Scheduler] Processing reminder trigger for ${id} (user: ${reminder.userId})`);

    const now = new Date();

    // 1. Create notification event via NotificationService
    await NotificationService.createNotification(
      reminder.userId,
      `Reminder: ${reminder.title}`,
      reminder.description || 'Your scheduled reminder is due now.',
      'reminder.due',
      `/reminders`,
      undefined,
      id
    );

    // 2. Record that the notification was sent, keep status as pending
    await this.repo.update(id, reminder.userId, {
      notification: {
        sentAt: now,
        lastNotifiedAt: now
      },
      scheduler: {
        provider: 'qstash',
        status: 'idle',
        lastTriggeredAt: now.toISOString(),
        scheduledFor: reminder.scheduler?.scheduledFor
      }
    });

    // 3. Publish to Event Bus
    const bus = EventBus.getInstance();
    bus.publish('reminder.due', { reminderId: id, userId: reminder.userId });
  }

  public static async cleanupOldReminders(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    console.log(`[Scheduler] Purging completed reminders older than ${thirtyDaysAgo.toISOString()}`);
    return this.repo.hardDeleteCompleted(thirtyDaysAgo);
  }

  public static async processDueReminders(): Promise<number> {
    const now = new Date();
    const due = await this.repo.findDue(now);
    const bus = EventBus.getInstance();

    for (const reminder of due) {
      const reminderId = reminder._id!.toString();

      await NotificationService.createNotification(
        reminder.userId,
        `Reminder: ${reminder.title}`,
        reminder.description || 'Your scheduled reminder is due now.',
        'reminder.due',
        `/reminders`,
        undefined,
        reminderId
      );

      // Record that the notification was sent, keep status as pending
      await this.repo.update(reminderId, reminder.userId, {
        notification: {
          sentAt: now,
          lastNotifiedAt: now
        },
        scheduler: {
          provider: 'qstash',
          status: 'idle',
          lastTriggeredAt: now.toISOString(),
          scheduledFor: reminder.scheduler?.scheduledFor
        }
      });

      bus.publish('reminder.due', { reminderId, userId: reminder.userId });
    }

    return due.length;
  }
}


