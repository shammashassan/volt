import { getDb } from '@/lib/db';
import { Reminder } from '@/types/reminder';
import { ObjectId } from 'mongodb';
import { UserId } from '@/types/shared';

export class ReminderRepository {
  async getCollection() {
    const db = await getDb();
    return db.collection<Reminder>('reminders');
  }

  async findById(id: string, userId: UserId): Promise<Reminder | null> {
    const col = await this.getCollection();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId } : { id, userId };
    return col.findOne(query) as Promise<Reminder | null>;
  }

  async findByIdRaw(id: string): Promise<Reminder | null> {
    const col = await this.getCollection();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
    return col.findOne(query) as Promise<Reminder | null>;
  }

  async findDue(now: Date): Promise<Reminder[]> {
    const col = await this.getCollection();
    return col.find({
      status: 'pending',
      triggerAt: { $lte: now }
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
      query,
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return res as unknown as Reminder | null;
  }

  async hardDelete(id: string, userId: UserId): Promise<boolean> {
    const col = await this.getCollection();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId } : { id, userId };
    const res = await col.deleteOne(query);
    return res.deletedCount > 0;
  }
}


