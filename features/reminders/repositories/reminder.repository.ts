import { getDb } from '@/lib/db';
import { Reminder } from '../schemas/reminder';
import { ObjectId } from 'mongodb';
import { UserId } from '@/features/shared/types';

export class ReminderRepository {
  async getCollection() {
    const db = await getDb();
    return db.collection<Reminder>('reminders');
  }

  async findById(id: string, userId: UserId): Promise<Reminder | null> {
    const col = await this.getCollection();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId } : { id, userId };
    return col.findOne({ ...query, deletedAt: { $exists: false } }) as Promise<Reminder | null>;
  }

  async findDue(now: Date): Promise<Reminder[]> {
    const col = await this.getCollection();
    return col.find({
      status: 'pending',
      triggerAt: { $lte: now },
      deletedAt: { $exists: false }
    }).toArray() as Promise<Reminder[]>;
  }

  async create(reminder: Omit<Reminder, 'createdAt' | 'updatedAt'>): Promise<Reminder> {
    const col = await this.getCollection();
    const doc: Reminder = {
      ...reminder,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const res = await col.insertOne(doc as any);
    return { ...doc, _id: res.insertedId };
  }

  async update(id: string, userId: UserId, updates: Partial<Reminder>): Promise<Reminder | null> {
    const col = await this.getCollection();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId } : { id, userId };
    const res = await col.findOneAndUpdate(
      { ...query, deletedAt: { $exists: false } },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return res as unknown as Reminder | null;
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
      deletedAt: { $lte: olderThan }
    });
    return res.deletedCount;
  }
}
