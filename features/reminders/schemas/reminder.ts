import { BaseDocument } from '@/features/shared/types';
import { ScheduleMetadata } from '@/lib/scheduler/types';

export type ReminderPriority = 'high' | 'medium' | 'low';
export type ReminderStatus = 'pending' | 'completed' | 'cancelled' | 'expired';

export interface ReminderAttachment {
  type: 'note' | 'project' | 'person' | 'resource' | 'watchlist';
  id: string;
  title?: string;
}

export interface Reminder extends BaseDocument {
  title: string;
  description?: string;
  status: ReminderStatus;
  priority: ReminderPriority;
  triggerAt: Date;
  sortOrder?: number;
  attachments: ReminderAttachment[];
  
  notification: {
    lastNotifiedAt?: Date;
    sentAt?: Date;
  };
  
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
    interval?: number;
  };

  scheduler?: ScheduleMetadata;
}

