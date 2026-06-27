import { NotificationRepository } from '../repositories/notification.repository';
import { Notification, NotificationType } from '../schemas/notification';
import { UserId } from '@/features/shared/types';

export class NotificationService {
  private static repo = new NotificationRepository();

  public static async createNotification(
    userId: UserId,
    title: string,
    message: string,
    type: NotificationType,
    link?: string,
    image?: string,
    reminderId?: string
  ): Promise<Notification> {
    return this.repo.create({
      userId,
      title,
      message,
      type,
      link,
      image,
      reminderId
    });
  }

  public static async getUnreadNotifications(userId: UserId): Promise<Notification[]> {
    return this.repo.findUnread(userId);
  }

  public static async markRead(id: string, userId: UserId): Promise<boolean> {
    return this.repo.markRead(id, userId);
  }

  public static async archiveNotification(id: string, userId: UserId): Promise<boolean> {
    return this.repo.archive(id, userId);
  }

  public static async deleteNotification(id: string, userId: UserId): Promise<boolean> {
    return this.repo.softDelete(id, userId);
  }

  public static async purgeOldNotifications(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.repo.hardDeleteExpired(thirtyDaysAgo);
  }
}
