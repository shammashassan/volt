import { BaseDocument } from '@/types/shared';

export const NotificationTypes = {
  WATCHLIST_RELEASE: 'watchlist.release',
  WATCHLIST_EPISODE: 'watchlist.episode',
  REMINDER_DUE: 'reminder.due',
  PROJECT_DEADLINE: 'project.deadline',
  SYSTEM: 'system',
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];

export interface Notification extends BaseDocument {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  image?: string;
  reminderId?: string;
  readAt?: Date;
  dismissedAt?: Date;
  archivedAt?: Date;
}
