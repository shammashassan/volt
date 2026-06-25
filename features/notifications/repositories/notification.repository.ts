import { getDb } from '@/lib/db';
import { Notification } from '../schemas/notification';
import { ObjectId } from 'mongodb';
import { UserId } from '@/features/shared/types';

export class NotificationRepository {
  async getCollection() {
    const db = await getDb();
    return db.collection<Notification>('notifications');
  }

  async findUnread(userId: UserId): Promise<Notification[]> {
    const col = await this.getCollection();
    return col.find({
      userId,
      readAt: { $exists: false },
      dismissedAt: { $exists: false },
      deletedAt: { $exists: false }
    }).sort({ createdAt: -1 }).toArray() as Promise<Notification[]>;
  }

  async create(notification: Omit<Notification, 'createdAt' | 'updatedAt'>): Promise<Notification> {
    const col = await this.getCollection();
    const doc: Notification = {
      ...notification,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const res = await col.insertOne(doc as any);
    return { ...doc, _id: res.insertedId };
  }

  async markRead(id: string, userId: UserId): Promise<boolean> {
    const col = await this.getCollection();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId } : { id, userId };
    const res = await col.updateOne(
      query,
      { $set: { readAt: new Date(), updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async archive(id: string, userId: UserId): Promise<boolean> {
    const col = await this.getCollection();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId } : { id, userId };
    const res = await col.updateOne(
      query,
      { $set: { archivedAt: new Date(), updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async softDelete(id: string, userId: UserId): Promise<boolean> {
    const col = await this.getCollection();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId } : { id, userId };
    const res = await col.updateOne(
      query,
      { $set: { deletedAt: new Date(), updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async hardDeleteExpired(olderThan: Date): Promise<number> {
    const col = await this.getCollection();
    const res = await col.deleteMany({
      $or: [
        { deletedAt: { $lte: olderThan } },
        { createdAt: { $lte: olderThan } } // 90 days retention limits
      ]
    });
    return res.deletedCount;
  }
}
