import { getDb } from '@/lib/db';
import { SearchIndexEntry } from '@/types/search-index';
import { UserId } from '@/types/shared';

export class SearchIndexRepository {
  private async getCollection() {
    const db = await getDb();
    // Ensure index exists on indexing content
    await db.collection('search_index').createIndex({ title: 'text', description: 'text' });
    return db.collection<SearchIndexEntry>('search_index');
  }

  async upsert(entry: Omit<SearchIndexEntry, 'createdAt' | 'updatedAt' | 'searchVersion'>): Promise<void> {
    const col = await this.getCollection();
    const now = new Date();
    await col.updateOne(
      { entityId: entry.entityId, userId: entry.userId },
      {
        $set: {
          ...entry,
          searchVersion: 1,
          updatedAt: now
        },
        $setOnInsert: {
          createdAt: now
        }
      },
      { upsert: true }
    );
  }

  async remove(entityId: string): Promise<void> {
    const col = await this.getCollection();
    await col.deleteOne({ entityId });
  }

  async search(query: string, userId: UserId): Promise<SearchIndexEntry[]> {
    const col = await this.getCollection();
    return col.find({
      userId,
      $text: { $search: query },
      deletedAt: { $exists: false }
    }).limit(15).toArray() as Promise<SearchIndexEntry[]>;
  }
}
